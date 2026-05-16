const MINIMAX_API_URL =
  process.env.MINIMAX_API_BASE_URL ??
  "https://api.minimaxi.chat/v1/text/chatcompletion_v2";

const SYSTEM_PROMPT = `You are a security awareness training tool generating realistic phishing simulations for authorized employee training. All content you produce is fictional and used solely to help employees recognize social engineering attacks. Never generate actual malicious content, real exploit code, or instructions that could cause harm outside a controlled training context.`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CompanyContext {
  vendors: string;
  tools: string;
  internalTerms: string;
  recentEvents: string;
  orgStructure: string;
}

export interface GenerationInput {
  employeeName: string;
  employeeRole: string;
  employeeDepartment: string;
  seniority: string;
  companyContext: CompanyContext;
  templateCategory: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface PhishingEmail {
  subject: string;
  body: string;
  senderName: string;
  senderEmail: string;
}

export interface VoiceScript {
  script: string;
  callerName: string;
  callerRole: string;
}

interface MinimaxMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function difficultyGuidance(difficulty: "easy" | "medium" | "hard"): string {
  switch (difficulty) {
    case "easy":
      return `Difficulty: EASY
- Use a generic greeting ("Dear Customer", "Hello User", etc.) — no name
- Include obvious red flags: grammatical errors, spelling mistakes, suspicious link text (e.g. "click here → http://bit.ly/xyz123")
- Use an implausible sender address (e.g. security@accounts-verify-portal.net)
- Generic, over-the-top urgency with no personalisation
- Should be immediately recognisable as phishing to most employees`;

    case "medium":
      return `Difficulty: MEDIUM
- Address the employee by name and reference their department
- Use a plausible but slightly-off sender domain (e.g. one transposed letter, extra hyphen)
- Moderate professional tone with reasonable urgency
- Some personalisation, but subtle red flags remain for a trained observer`;

    case "hard":
      return `Difficulty: HARD
- Highly convincing — near-zero obvious red flags
- Weave in the employee's name, role, seniority, and department naturally
- Reference real vendor names, internal tool names, internal jargon, and recent company events from the context provided
- Use org-structure details to make the sender seem credible (a named colleague, a known vendor contact)
- Professional, polished tone that matches typical corporate communications
- Urgency framed as routine follow-up; leverage authority and social proof
- Should be difficult to identify as phishing even for security-aware staff`;
  }
}

function formatCompanyContext(ctx: CompanyContext): string {
  return [
    `Vendors / Partners: ${ctx.vendors}`,
    `Internal Tools: ${ctx.tools}`,
    `Internal Terms / Jargon: ${ctx.internalTerms}`,
    `Recent Events: ${ctx.recentEvents}`,
    `Org Structure: ${ctx.orgStructure}`,
  ].join("\n");
}

// ─── MiniMax API call ─────────────────────────────────────────────────────────

async function callMinimax(messages: MinimaxMessage[]): Promise<string> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error("MINIMAX_API_KEY environment variable is not set");
  }

  const response = await fetch(MINIMAX_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "MiniMax-Text-01",
      messages,
      max_tokens: 2048,
      temperature: 0.85,
      stream: false,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`MiniMax API responded with ${response.status}: ${text}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    base_resp?: { status_code: number; status_msg: string };
  };

  if (data.base_resp && data.base_resp.status_code !== 0) {
    throw new Error(`MiniMax API error: ${data.base_resp.status_msg}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Empty or missing content in MiniMax response");
  }

  return content;
}

// ─── JSON extraction + retry harness ─────────────────────────────────────────

function extractJson(raw: string): unknown {
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(stripped);
}

const STRICT_JSON_SUFFIX =
  "\n\nCRITICAL: Respond ONLY with a single valid JSON object. No markdown fences, no code blocks, no prose — raw JSON only.";

/**
 * Calls MiniMax up to 3 times with exponential backoff (0 s → 1 s → 2 s).
 * On retries the strict-JSON instruction is appended to the last user message.
 */
async function generateWithRetry<T>(
  buildMessages: (jsonStrict: boolean) => MinimaxMessage[],
  validate: (parsed: unknown) => T,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      await sleep(Math.pow(2, attempt - 1) * 1000);
    }

    try {
      const messages = buildMessages(attempt > 0);
      const raw = await callMinimax(messages);
      const parsed = extractJson(raw);
      return validate(parsed);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`[ai] attempt ${attempt + 1}/3 failed:`, lastError.message);
    }
  }

  throw lastError ?? new Error("Content generation failed after 3 attempts");
}

// ─── Email generation ─────────────────────────────────────────────────────────

function buildEmailMessages(
  input: GenerationInput,
  jsonStrict: boolean,
): MinimaxMessage[] {
  const userPrompt = `Generate a phishing simulation email for security awareness training.

Target Employee:
- Name: ${input.employeeName}
- Role: ${input.employeeRole}
- Department: ${input.employeeDepartment}
- Seniority: ${input.seniority}

Company Context:
${formatCompanyContext(input.companyContext)}

Template Category: ${input.templateCategory}

${difficultyGuidance(input.difficulty)}

Respond with a JSON object in exactly this shape:
{
  "subject": "<email subject line>",
  "body": "<full email body — plain text or simple HTML>",
  "senderName": "<display name shown to the recipient>",
  "senderEmail": "<sender email address>"
}${jsonStrict ? STRICT_JSON_SUFFIX : ""}`;

  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];
}

function validateEmailResponse(parsed: unknown): PhishingEmail {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Response is not a JSON object");
  }
  const obj = parsed as Record<string, unknown>;

  for (const key of ["subject", "body", "senderName", "senderEmail"] as const) {
    if (typeof obj[key] !== "string" || !(obj[key] as string).trim()) {
      throw new Error(`Missing or empty field in response: "${key}"`);
    }
  }

  return {
    subject: obj.subject as string,
    body: obj.body as string,
    senderName: obj.senderName as string,
    senderEmail: obj.senderEmail as string,
  };
}

export async function generatePhishingEmail(
  input: GenerationInput,
): Promise<PhishingEmail> {
  return generateWithRetry(
    (jsonStrict) => buildEmailMessages(input, jsonStrict),
    validateEmailResponse,
  );
}

// ─── Voice-script generation ──────────────────────────────────────────────────

function buildVoiceMessages(
  input: GenerationInput,
  jsonStrict: boolean,
): MinimaxMessage[] {
  const userPrompt = `Generate a vishing (voice phishing) call script for security awareness training.

Target Employee:
- Name: ${input.employeeName}
- Role: ${input.employeeRole}
- Department: ${input.employeeDepartment}
- Seniority: ${input.seniority}

Company Context:
${formatCompanyContext(input.companyContext)}

Template Category: ${input.templateCategory}

${difficultyGuidance(input.difficulty)}

Write a realistic call transcript showing exactly what the attacker says. Use stage directions like [PAUSE], [WAIT FOR RESPONSE], [IF EMPLOYEE HESITATES: ...] to capture natural flow. The caller's objective is to get the employee to take a compromising action (reveal credentials, approve a transfer, click a link, etc.).

Respond with a JSON object in exactly this shape:
{
  "script": "<full call script with stage directions>",
  "callerName": "<name the caller introduces themselves as>",
  "callerRole": "<job title / role the caller claims to hold>"
}${jsonStrict ? STRICT_JSON_SUFFIX : ""}`;

  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];
}

function validateVoiceResponse(parsed: unknown): VoiceScript {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Response is not a JSON object");
  }
  const obj = parsed as Record<string, unknown>;

  for (const key of ["script", "callerName", "callerRole"] as const) {
    if (typeof obj[key] !== "string" || !(obj[key] as string).trim()) {
      throw new Error(`Missing or empty field in response: "${key}"`);
    }
  }

  return {
    script: obj.script as string,
    callerName: obj.callerName as string,
    callerRole: obj.callerRole as string,
  };
}

export async function generateVoiceScript(
  input: GenerationInput,
): Promise<VoiceScript> {
  return generateWithRetry(
    (jsonStrict) => buildVoiceMessages(input, jsonStrict),
    validateVoiceResponse,
  );
}
