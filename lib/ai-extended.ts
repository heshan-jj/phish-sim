import type { CampaignTemplate } from "@/lib/campaign-templates";
import type {
  CompanyContext,
  GenerationInput,
  PhishingEmail,
} from "@/lib/ai";
import { generateWithRetryLowTemp } from "@/lib/ai";

const SYSTEM_PROMPT = `You are a security awareness training tool generating realistic phishing simulations for authorized employee training. All content you produce is fictional and used solely to help employees recognize social engineering attacks. Never generate actual malicious content, real exploit code, or instructions that could cause harm outside a controlled training context.`;

export interface SmishingMessage {
  message: string;
  senderLabel: string;
}

export interface SafetyReviewResult {
  severity: "low" | "medium" | "high";
  issues: string[];
  approved: boolean;
}

export interface ScenarioDraftResult {
  templateId: string;
  difficulty: "Easy" | "Medium" | "Hard";
  contentMode: "static" | "ai" | "hybrid";
  sampleSubject: string;
  rationale: string;
}

export interface TemplateRecommendation {
  templateId: string;
  reason: string;
  suggestedDifficulty: "Easy" | "Medium" | "Hard";
}

export interface SuggestedOrgContext {
  vendors: string;
  terminology: string;
  events: string;
  orgStructure: string;
}

function localeLine(locale?: string): string {
  if (!locale || locale === "en") return "";
  return `\nWrite all content in language/locale: ${locale}.`;
}

export async function generateHybridPhishingEmail(
  input: GenerationInput,
  template: CampaignTemplate,
  actionUrl: string,
): Promise<PhishingEmail> {
  return generateWithRetryLowTemp(
    (jsonStrict) => [
      { role: "system" as const, content: SYSTEM_PROMPT },
      {
        role: "user" as const,
        content: `Generate a phishing simulation email for security awareness training.

Use this template as a creative brief (match intent, category, and urgency):
- Title: ${template.title}
- Description: ${template.description}
- Base subject: ${template.subject}
- Base body: ${template.body}
- Button text: ${template.buttonText}
- Urgency: ${template.urgencyLevel}
- Landing type: ${template.landingPageType}

The email must include a clear call-to-action link. Use this exact URL for the primary button/link: ${actionUrl}

Target Employee:
- Name: ${input.employeeName}
- Role: ${input.employeeRole}
- Department: ${input.employeeDepartment}
- Seniority: ${input.seniority}

Template Category: ${input.templateCategory}
Difficulty: ${input.difficulty}${localeLine(input.locale)}

Respond with JSON: { "subject", "body", "senderName", "senderEmail" }${
          jsonStrict
            ? "\n\nCRITICAL: Respond ONLY with a single valid JSON object. No markdown."
            : ""
        }`,
      },
    ],
    (parsed) => {
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Response is not a JSON object");
      }
      const obj = parsed as Record<string, unknown>;
      for (const key of ["subject", "body", "senderName", "senderEmail"] as const) {
        if (typeof obj[key] !== "string" || !(obj[key] as string).trim()) {
          throw new Error(`Missing field: ${key}`);
        }
      }
      return {
        subject: obj.subject as string,
        body: obj.body as string,
        senderName: obj.senderName as string,
        senderEmail: obj.senderEmail as string,
      };
    },
  );
}

export async function generateRedFlags(email: PhishingEmail): Promise<string[]> {
  return generateWithRetryLowTemp(
    (jsonStrict) => [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Analyze this simulated phishing email and list 3-5 specific red flags a trainee should notice.

Subject: ${email.subject}
From: ${email.senderName} <${email.senderEmail}>
Body:
${email.body.slice(0, 2000)}

Respond with JSON: { "redFlags": ["...", "..."] }${jsonStrict ? "\n\nCRITICAL: Raw JSON only." : ""}`,
      },
    ],
    (parsed) => {
      const obj = parsed as Record<string, unknown>;
      if (!Array.isArray(obj.redFlags)) throw new Error("Missing redFlags array");
      const flags = obj.redFlags.filter(
        (f): f is string => typeof f === "string" && f.trim().length > 0,
      );
      if (flags.length === 0) throw new Error("Empty redFlags");
      return flags.slice(0, 5);
    },
  );
}

export async function generateCoachingTip(params: {
  department: string;
  role: string;
  actionTaken: "compromised" | "reported";
  emailSubject: string;
}): Promise<string> {
  const actionLabel =
    params.actionTaken === "reported"
      ? "successfully reported a simulated phishing email"
      : "clicked through a simulated phishing email";
  return generateWithRetryLowTemp(
    (jsonStrict) => [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Write a 2-3 sentence security coaching tip for an employee who ${actionLabel}.
Department: ${params.department}
Role: ${params.role}
Email subject: ${params.emailSubject}
Be supportive, specific, and actionable. No blame.

Respond with JSON: { "tip": "..." }${jsonStrict ? "\n\nCRITICAL: Raw JSON only." : ""}`,
      },
    ],
    (parsed) => {
      const obj = parsed as Record<string, unknown>;
      if (typeof obj.tip !== "string" || !obj.tip.trim()) {
        throw new Error("Missing tip");
      }
      return obj.tip.trim();
    },
  );
}

export async function generateReportFeedback(params: {
  department: string;
  role: string;
}): Promise<string> {
  return generateWithRetryLowTemp(
    (jsonStrict) => [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Write 2-3 sentences praising an employee for correctly reporting a simulated phishing email.
Department: ${params.department}
Role: ${params.role}
Be encouraging and mention one habit to keep.

Respond with JSON: { "feedback": "..." }${jsonStrict ? "\n\nCRITICAL: Raw JSON only." : ""}`,
      },
    ],
    (parsed) => {
      const obj = parsed as Record<string, unknown>;
      if (typeof obj.feedback !== "string" || !obj.feedback.trim()) {
        throw new Error("Missing feedback");
      }
      return obj.feedback.trim();
    },
  );
}

export interface CampaignSummaryStats {
  totalSent: number;
  openRate: number;
  clickRate: number;
  compromiseRate: number;
  reportRate: number;
  topDepartment?: string;
}

export async function generateCampaignSummary(
  stats: CampaignSummaryStats,
  orgName: string,
  templateName: string,
  companyContext: CompanyContext,
): Promise<string> {
  return generateWithRetryLowTemp(
    (jsonStrict) => [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Write a 3-4 sentence executive summary for a security admin about a phishing simulation campaign.

Organization: ${orgName}
Template: ${templateName}
Sent: ${stats.totalSent}
Open rate: ${stats.openRate}%
Click rate: ${stats.clickRate}%
Compromise rate: ${stats.compromiseRate}%
Report rate: ${stats.reportRate}%
${stats.topDepartment ? `Most affected department: ${stats.topDepartment}` : ""}

Company context (brief): vendors/tools: ${companyContext.vendors.slice(0, 200)}

Respond with JSON: { "summary": "..." }${jsonStrict ? "\n\nCRITICAL: Raw JSON only." : ""}`,
      },
    ],
    (parsed) => {
      const obj = parsed as Record<string, unknown>;
      if (typeof obj.summary !== "string" || !obj.summary.trim()) {
        throw new Error("Missing summary");
      }
      return obj.summary.trim();
    },
  );
}

export async function reviewContentSafety(
  email: PhishingEmail,
): Promise<SafetyReviewResult> {
  return generateWithRetryLowTemp(
    (jsonStrict) => [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Review this simulated phishing email for a corporate training platform. Flag issues: real harm instructions, excessive aggression, missing training context, or requests for illegal actions.

Subject: ${email.subject}
Body: ${email.body.slice(0, 2500)}

Respond with JSON:
{
  "severity": "low" | "medium" | "high",
  "issues": ["..."],
  "approved": true | false
}
Set approved=false if severity is high.${jsonStrict ? "\n\nCRITICAL: Raw JSON only." : ""}`,
      },
    ],
    (parsed) => {
      const obj = parsed as Record<string, unknown>;
      const severity = obj.severity;
      if (severity !== "low" && severity !== "medium" && severity !== "high") {
        throw new Error("Invalid severity");
      }
      const issues = Array.isArray(obj.issues)
        ? obj.issues.filter((i): i is string => typeof i === "string")
        : [];
      const approved =
        typeof obj.approved === "boolean"
          ? obj.approved
          : severity !== "high";
      return { severity, issues, approved };
    },
  );
}

export async function generateSmishingMessage(
  input: GenerationInput,
  actionUrl: string,
): Promise<SmishingMessage> {
  return generateWithRetryLowTemp(
    (jsonStrict) => [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Generate a smishing (SMS phishing) message for security training.

Target: ${input.employeeName}, ${input.employeeRole}, ${input.employeeDepartment}
Category: ${input.templateCategory}
Difficulty: ${input.difficulty}
Include this link in the message: ${actionUrl}${localeLine(input.locale)}

Respond with JSON: { "message": "...", "senderLabel": "..." }${jsonStrict ? "\n\nCRITICAL: Raw JSON only." : ""}`,
      },
    ],
    (parsed) => {
      const obj = parsed as Record<string, unknown>;
      if (typeof obj.message !== "string" || !obj.message.trim()) {
        throw new Error("Missing message");
      }
      if (typeof obj.senderLabel !== "string" || !obj.senderLabel.trim()) {
        throw new Error("Missing senderLabel");
      }
      return {
        message: obj.message as string,
        senderLabel: obj.senderLabel as string,
      };
    },
  );
}

export async function suggestOrgContext(
  companyName: string,
  industry: string,
): Promise<SuggestedOrgContext> {
  return generateWithRetryLowTemp(
    (jsonStrict) => [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Suggest realistic fictional company context for phishing simulation training.

Company: ${companyName}
Industry: ${industry}

Respond with JSON:
{
  "vendors": "comma-separated tools/vendors",
  "terminology": "internal jargon",
  "events": "recent fictional events",
  "orgStructure": "org size and departments"
}${jsonStrict ? "\n\nCRITICAL: Raw JSON only." : ""}`,
      },
    ],
    (parsed) => {
      const obj = parsed as Record<string, unknown>;
      return {
        vendors: String(obj.vendors ?? ""),
        terminology: String(obj.terminology ?? ""),
        events: String(obj.events ?? ""),
        orgStructure: String(obj.orgStructure ?? ""),
      };
    },
  );
}

export async function suggestScenarioDraft(
  description: string,
  templateIds: string[],
): Promise<ScenarioDraftResult> {
  return generateWithRetryLowTemp(
    (jsonStrict) => [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Given a natural-language phishing simulation scenario, pick the best matching template ID and settings.

Scenario: ${description}
Available template IDs: ${templateIds.join(", ")}

Respond with JSON:
{
  "templateId": "<one of the IDs>",
  "difficulty": "Easy" | "Medium" | "Hard",
  "contentMode": "static" | "ai" | "hybrid",
  "sampleSubject": "...",
  "rationale": "one sentence"
}${jsonStrict ? "\n\nCRITICAL: Raw JSON only." : ""}`,
      },
    ],
    (parsed) => {
      const obj = parsed as Record<string, unknown>;
      if (typeof obj.templateId !== "string") throw new Error("Missing templateId");
      return {
        templateId: obj.templateId,
        difficulty: (obj.difficulty as ScenarioDraftResult["difficulty"]) || "Medium",
        contentMode: (obj.contentMode as ScenarioDraftResult["contentMode"]) || "ai",
        sampleSubject: String(obj.sampleSubject ?? ""),
        rationale: String(obj.rationale ?? ""),
      };
    },
  );
}

export async function suggestEmployeeFieldMappings(
  rows: Array<{ name: string; email: string; role?: string }>,
): Promise<Array<{ index: number; department: string; seniority: string }>> {
  const sample = rows.slice(0, 20);
  return generateWithRetryLowTemp(
    (jsonStrict) => [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `For each employee row, suggest department and seniority based on role/title. Use generic values if unclear.

Rows: ${JSON.stringify(sample)}

Respond with JSON: { "suggestions": [{ "index": 0, "department": "...", "seniority": "..." }] }${jsonStrict ? "\n\nCRITICAL: Raw JSON only." : ""}`,
      },
    ],
    (parsed) => {
      const obj = parsed as Record<string, unknown>;
      if (!Array.isArray(obj.suggestions)) throw new Error("Missing suggestions");
      return obj.suggestions
        .filter(
          (s): s is { index: number; department: string; seniority: string } =>
            typeof s === "object" &&
            s !== null &&
            typeof (s as Record<string, unknown>).index === "number",
        )
        .map((s) => ({
          index: s.index as number,
          department: String((s as Record<string, unknown>).department ?? "General"),
          seniority: String(
            (s as Record<string, unknown>).seniority ?? "Individual contributor",
          ),
        }));
    },
  );
}

export async function recommendTemplates(params: {
  templateOptions: Array<{ id: string; title: string; category: string }>;
  vulnerableDepartment: string;
  pastTemplateIds: string[];
}): Promise<TemplateRecommendation[]> {
  return generateWithRetryLowTemp(
    (jsonStrict) => [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Recommend the top 3 phishing simulation templates for the next campaign.

Department with highest compromise rate: ${params.vulnerableDepartment}
Past templates used: ${params.pastTemplateIds.join(", ") || "none"}
Available templates: ${JSON.stringify(params.templateOptions.slice(0, 30))}

Respond with JSON:
{ "recommendations": [{ "templateId", "reason", "suggestedDifficulty": "Easy"|"Medium"|"Hard" }] }
Max 3 items.${jsonStrict ? "\n\nCRITICAL: Raw JSON only." : ""}`,
      },
    ],
    (parsed) => {
      const obj = parsed as Record<string, unknown>;
      if (!Array.isArray(obj.recommendations)) {
        throw new Error("Missing recommendations");
      }
      return obj.recommendations.slice(0, 3).map((r) => {
        const item = r as Record<string, unknown>;
        return {
          templateId: String(item.templateId ?? ""),
          reason: String(item.reason ?? ""),
          suggestedDifficulty:
            (item.suggestedDifficulty as TemplateRecommendation["suggestedDifficulty"]) ||
            "Medium",
        };
      });
    },
  );
}
