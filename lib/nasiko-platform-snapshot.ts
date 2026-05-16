import { getNasikoAuthToken, nasikoBaseUrl, nasikoTimeoutMs } from "@/lib/ai-nasiko";
import {
  appendPlatformLog,
  inferLogLevel,
  type PlatformLogEntry,
} from "@/lib/platform-logs";

type AgentCard = {
  name?: string;
  url?: string;
};

async function probe(
  label: string,
  url: string,
  init?: RequestInit,
): Promise<{ ok: boolean; detail: string }> {
  try {
    const response = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(nasikoTimeoutMs()),
    });
    const body = await response.text();
    const detail = body.slice(0, 240).replace(/\s+/g, " ").trim();
    return {
      ok: response.ok,
      detail: detail || `HTTP ${response.status}`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, detail: message };
  }
}

function logProbe(
  source: string,
  label: string,
  result: { ok: boolean; detail: string },
): PlatformLogEntry {
  const message = `${label}: ${result.detail}`;
  return appendPlatformLog({
    level: inferLogLevel(message, { httpOk: result.ok }),
    source,
    message,
  });
}

export async function refreshNasikoPlatformLogs(): Promise<{
  appended: number;
  configured: boolean;
}> {
  let token: string;
  try {
    token = await getNasikoAuthToken();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    appendPlatformLog({
      level: "ERROR",
      source: "nasiko-auth",
      message: `Nasiko login failed: ${message}`,
    });
    return { appended: 1, configured: false };
  }

  const base = nasikoBaseUrl();
  const headers = { Authorization: `Bearer ${token}` };
  let appended = 0;

  const checks: Array<Promise<unknown>> = [
    (async () => {
      const result = await probe("Kong gateway", `${base}/health`);
      logProbe("nasiko-gateway", "Kong /health", result);
      appended += 1;
    })(),
    (async () => {
      const result = await probe("Nasiko API", `${base}/api/v1/healthcheck`);
      logProbe("nasiko-backend", "API healthcheck", result);
      appended += 1;
    })(),
    (async () => {
      const result = await probe(
        "Nasiko router",
        `${base}/router/health`,
      );
      logProbe("nasiko-router", "Router /router/health", result);
      appended += 1;
    })(),
    (async () => {
      try {
        const response = await fetch(
          `${base}/api/v1/registry/user/agents/info`,
          { headers, signal: AbortSignal.timeout(nasikoTimeoutMs()) },
        );
        const body = await response.text();
        if (!response.ok) {
          logProbe("nasiko-registry", "Agent registry", {
            ok: false,
            detail: `HTTP ${response.status}: ${body.slice(0, 180)}`,
          });
          appended += 1;
          return;
        }

        const parsed = JSON.parse(body) as { data?: AgentCard[] };
        const agents = parsed.data ?? [];
        appendPlatformLog({
          level: "INFO",
          source: "nasiko-registry",
          message: `Registry lists ${agents.length} agent(s)`,
        });
        appended += 1;

        for (const agent of agents) {
          const name = agent.name?.trim();
          if (!name) continue;

          const healthUrl =
            agent.url?.replace(/\/$/, "") ??
            `${base}/agents/agent-${name}`;
          const healthProbe = await probe(
            `agent:${name}`,
            `${healthUrl.replace(/\/$/, "")}/health`,
          );
          logProbe(`agent-${name}`, `Agent ${name} health`, healthProbe);
          appended += 1;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        appendPlatformLog({
          level: "ERROR",
          source: "nasiko-registry",
          message: `Registry fetch failed: ${message}`,
        });
        appended += 1;
      }
    })(),
  ];

  await Promise.all(checks);

  appendPlatformLog({
    level: "INFO",
    source: "nasiko-monitor",
    message: `Platform snapshot refreshed at ${new Date().toISOString()}`,
  });
  appended += 1;

  return { appended, configured: true };
}
