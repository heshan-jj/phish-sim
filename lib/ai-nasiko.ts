import { appendPlatformLog, inferLogLevel } from "@/lib/platform-logs";

export type LlmMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AiProvider = "nasiko" | "minimax";

const DEFAULT_TIMEOUT_MS = 60_000;

let cachedJwt: { token: string; expiresAt: number } | null = null;

export function getAiProvider(): AiProvider {
  const value = (process.env.AI_PROVIDER ?? "minimax").toLowerCase();
  return value === "nasiko" ? "nasiko" : "minimax";
}

export function assertNasikoConfigured(): void {
  const missing: string[] = [];
  if (!process.env.NASIKO_BASE_URL?.trim()) missing.push("NASIKO_BASE_URL");
  if (!process.env.NASIKO_ACCESS_KEY?.trim()) missing.push("NASIKO_ACCESS_KEY");
  if (!process.env.NASIKO_ACCESS_SECRET?.trim()) {
    missing.push("NASIKO_ACCESS_SECRET");
  }
  if (missing.length > 0) {
    throw new Error(
      `Nasiko provider requires: ${missing.join(", ")}`,
    );
  }
}

export function assertAiConfigured(): void {
  if (getAiProvider() === "nasiko") {
    assertNasikoConfigured();
    return;
  }
  if (!process.env.MINIMAX_API_KEY) {
    throw new Error("MINIMAX_API_KEY environment variable is not set");
  }
}

export function nasikoBaseUrl(): string {
  return process.env.NASIKO_BASE_URL!.replace(/\/$/, "");
}

export function nasikoTimeoutMs(): number {
  const parsed = Number(process.env.NASIKO_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

function formatMessagesForNasiko(messages: LlmMessage[]): string {
  return messages
    .map((m) => `[${m.role.toUpperCase()}]\n${m.content}`)
    .join("\n\n");
}

interface RouterStreamLine {
  message?: string;
  is_int_response?: boolean;
}

export function parseNasikoRouterStream(body: string): string {
  const lines = body.split("\n").map((line) => line.trim()).filter(Boolean);
  let lastFinal = "";

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line) as RouterStreamLine;
      if (
        parsed.is_int_response === false &&
        typeof parsed.message === "string" &&
        parsed.message.trim()
      ) {
        lastFinal = parsed.message;
      }
    } catch {
      // Skip malformed NDJSON lines.
    }
  }

  if (!lastFinal.trim()) {
    throw new Error("No final agent message in Nasiko router response");
  }

  return lastFinal;
}

function nasikoDirectAgentUrl(): string | null {
  const raw = process.env.NASIKO_AGENT_ROUTE?.trim();
  if (!raw) return null;
  // Kong registers agents at /agents/agent-{name} without a trailing slash.
  return raw.replace(/\/$/, "");
}

function nasikoAgentPostUrls(agentUrl: string): string[] {
  const base = agentUrl.replace(/\/$/, "");
  return [base, `${base}/`];
}

export function buildNasikoA2aPayload(
  sessionId: string,
  query: string,
): Record<string, unknown> {
  return {
    jsonrpc: "2.0",
    id: sessionId,
    method: "message/send",
    params: {
      message: {
        role: "user",
        parts: [{ kind: "text", text: query }],
        messageId: crypto.randomUUID(),
        contextId: crypto.randomUUID(),
      },
      configuration: { blocking: true },
      metadata: {},
    },
  };
}

type A2aPart = { kind?: string; text?: string };
type A2aMessage = { kind?: string; parts?: A2aPart[]; artifacts?: A2aMessage[] };

function extractTextFromA2aMessage(message: A2aMessage): string {
  const parts = message.parts ?? [];
  const texts = parts
    .filter((p) => p.kind === "text" && typeof p.text === "string")
    .map((p) => p.text as string);

  if (!texts.length) {
    throw new Error("No text parts in Nasiko agent message");
  }

  return texts.join("\n");
}

/** Extract assistant text from an A2A JSON-RPC response (same shape as Nasiko router agent_client). */
export function extractNasikoAgentResponse(data: Record<string, unknown>): string {
  if (data.error) {
    const err = data.error as { message?: string };
    throw new Error(
      `Nasiko agent error: ${err.message ?? JSON.stringify(data.error)}`,
    );
  }

  const result = data.result as A2aMessage | undefined;
  if (!result) {
    throw new Error("Nasiko agent response missing result");
  }

  if (result.kind === "message") {
    return extractTextFromA2aMessage(result);
  }

  if (result.kind === "task") {
    const artifacts = result.artifacts;
    if (!artifacts?.length) {
      throw new Error("Nasiko agent task returned no artifacts");
    }
    return extractTextFromA2aMessage(artifacts[artifacts.length - 1]!);
  }

  throw new Error(`Unknown Nasiko agent response kind: ${result.kind ?? "none"}`);
}

async function callNasikoAgentDirect(
  agentUrl: string,
  query: string,
  token: string,
  sessionId: string,
): Promise<string> {
  const payload = JSON.stringify(buildNasikoA2aPayload(sessionId, query));
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  let lastError: Error | null = null;

  for (const url of nasikoAgentPostUrls(agentUrl)) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: payload,
        signal: AbortSignal.timeout(nasikoTimeoutMs()),
      });

      const body = await response.text();

      if (!response.ok) {
        lastError = new Error(
          `Nasiko agent responded with ${response.status}: ${body.slice(0, 500)}`,
        );
        if (response.status === 404 || response.status === 405) {
          continue;
        }
        throw lastError;
      }

      let data: Record<string, unknown>;
      try {
        data = JSON.parse(body) as Record<string, unknown>;
      } catch {
        throw new Error(
          `Nasiko agent returned invalid JSON: ${body.slice(0, 500)}`,
        );
      }

      return extractNasikoAgentResponse(data);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error("Nasiko direct agent call failed");
}

export async function getNasikoAuthToken(): Promise<string> {
  if (cachedJwt && Date.now() < cachedJwt.expiresAt) {
    return cachedJwt.token;
  }

  const response = await fetch(`${nasikoBaseUrl()}/auth/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_key: process.env.NASIKO_ACCESS_KEY,
      access_secret: process.env.NASIKO_ACCESS_SECRET,
    }),
    signal: AbortSignal.timeout(nasikoTimeoutMs()),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Nasiko login failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as { token?: string };
  if (!data.token) {
    throw new Error("Nasiko login response missing token");
  }

  cachedJwt = {
    token: data.token,
    expiresAt: Date.now() + 50 * 60 * 1000,
  };

  return data.token;
}

async function callNasikoRouter(
  messages: LlmMessage[],
  token: string,
  sessionId: string,
): Promise<string> {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("query", formatMessagesForNasiko(messages));

  const response = await fetch(`${nasikoBaseUrl()}/router`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    signal: AbortSignal.timeout(nasikoTimeoutMs()),
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(`Nasiko router responded with ${response.status}: ${body}`);
  }

  return parseNasikoRouterStream(body);
}

export async function callNasiko(
  messages: LlmMessage[],
  _temperature = 0.85,
): Promise<string> {
  void _temperature;
  assertNasikoConfigured();
  const startedAt = Date.now();

  try {
    const token = await getNasikoAuthToken();
    const sessionId = `phish-sim-${crypto.randomUUID()}`;
    const query = formatMessagesForNasiko(messages);
    const directAgentUrl = nasikoDirectAgentUrl();

    let content: string;
    if (directAgentUrl) {
      try {
        content = await callNasikoAgentDirect(
          directAgentUrl,
          query,
          token,
          sessionId,
        );
      } catch (directErr) {
        const message =
          directErr instanceof Error ? directErr.message : String(directErr);
        console.warn("[ai] Nasiko direct agent failed, trying router", {
          agentUrl: directAgentUrl,
          error: message,
        });
        appendPlatformLog({
          level: "WARNING",
          source: "phish-sim-ai",
          message: `Direct agent failed, falling back to router: ${message.slice(0, 200)}`,
        });
        content = await callNasikoRouter(messages, token, sessionId);
      }
    } else {
      content = await callNasikoRouter(messages, token, sessionId);
    }

    const mode = directAgentUrl ? "direct-agent" : "router";
    const durationMs = Date.now() - startedAt;

    console.info("[ai] Nasiko response received", {
      baseUrl: nasikoBaseUrl(),
      mode,
      agentUrl: directAgentUrl ?? undefined,
      durationMs,
      contentLength: content.length,
    });

    appendPlatformLog({
      level: "INFO",
      source: "phish-sim-ai",
      message: `Nasiko ${mode} OK (${durationMs}ms, ${content.length} chars)`,
    });

    return content;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    appendPlatformLog({
      level: inferLogLevel(message, { httpOk: false }),
      source: "phish-sim-ai",
      message: `Nasiko request failed: ${message.slice(0, 240)}`,
    });
    throw err;
  }
}
