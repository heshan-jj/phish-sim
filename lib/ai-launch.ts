import type { ContentMode } from "@/lib/campaign-settings";
import type { CampaignTemplate } from "@/lib/campaign-templates";
import type { PhishingEmail } from "@/lib/ai";
import {
  generatePhishingEmail,
  generateVoiceScript,
  type VoiceScript,
} from "@/lib/ai";
import { generateHybridPhishingEmail, generateRedFlags, generateSmishingMessage } from "@/lib/ai-extended";
import { buildGenerationInput, type EmployeeForGeneration } from "@/lib/generation-input";
import {
  personalizeText,
  renderCampaignEmail,
  renderGeneratedCampaignEmail,
} from "@/lib/campaign-templates";
import type { OrgContext } from "@/app/onboarding/_actions";
import { assertAiConfigured } from "@/lib/ai";

const AI_CONCURRENCY = Math.max(
  1,
  Math.min(5, Number(process.env.AI_LAUNCH_CONCURRENCY ?? "2")),
);

export interface ResolvedEmailContent {
  subject: string;
  body: string;
  senderName: string;
  senderEmail: string;
  redFlags: string[];
  contentMode: ContentMode;
  aiFallback: boolean;
}

export interface ResolveEmailParams {
  contentMode: ContentMode;
  template: CampaignTemplate;
  employee: EmployeeForGeneration;
  orgContext: OrgContext | null | undefined;
  campaignDifficulty: string;
  placeholders: Record<string, string>;
  actionUrl: string;
  variation: string;
  locale?: string;
}

async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return results;
}

export { runWithConcurrency, AI_CONCURRENCY };

function staticEmail(
  template: CampaignTemplate,
  placeholders: Record<string, string>,
  actionUrl: string,
  variation: string,
): PhishingEmail & { redFlags: string[] } {
  return {
    subject: personalizeText(template.subject, placeholders),
    body: renderCampaignEmail({ template, placeholders, actionUrl, variation }),
    senderName: template.senderName,
    senderEmail: template.senderEmail,
    redFlags: template.redFlags,
  };
}

export async function resolvePhishingEmailContent(
  params: ResolveEmailParams,
): Promise<ResolvedEmailContent> {
  const {
    contentMode,
    template,
    employee,
    orgContext,
    campaignDifficulty,
    placeholders,
    actionUrl,
    variation,
    locale,
  } = params;

  if (contentMode === "static") {
    const s = staticEmail(template, placeholders, actionUrl, variation);
    return {
      subject: s.subject,
      body: s.body,
      senderName: s.senderName,
      senderEmail: s.senderEmail,
      redFlags: s.redFlags,
      contentMode: "static",
      aiFallback: false,
    };
  }

  try {
    assertAiConfigured();
    const input = buildGenerationInput({
      employee,
      orgContext,
      template,
      campaignDifficulty,
      locale,
    });

    let email: PhishingEmail;
    if (contentMode === "hybrid") {
      email = await generateHybridPhishingEmail(input, template, actionUrl);
    } else {
      email = await generatePhishingEmail(input);
    }

    let redFlags = template.redFlags;
    try {
      redFlags = await generateRedFlags(email);
    } catch {
      // keep template red flags
    }

    const body = renderGeneratedCampaignEmail({
      template,
      placeholders,
      actionUrl,
      variation,
      subject: email.subject,
      body: email.body,
    });

    return {
      subject: email.subject,
      body,
      senderName: email.senderName,
      senderEmail: email.senderEmail,
      redFlags,
      contentMode,
      aiFallback: false,
    };
  } catch (err) {
    console.error("[ai-launch] AI generation failed, using static fallback", {
      error: err instanceof Error ? err.message : String(err),
    });
    const s = staticEmail(template, placeholders, actionUrl, variation);
    return {
      subject: s.subject,
      body: s.body,
      senderName: s.senderName,
      senderEmail: s.senderEmail,
      redFlags: s.redFlags,
      contentMode,
      aiFallback: true,
    };
  }
}

export async function resolveVoiceScript(params: {
  template: CampaignTemplate;
  employee: EmployeeForGeneration;
  orgContext: OrgContext | null | undefined;
  campaignDifficulty: string;
  locale?: string;
}): Promise<{ script: VoiceScript; aiFallback: boolean }> {
  try {
    assertAiConfigured();
    const input = buildGenerationInput({
      employee: params.employee,
      orgContext: params.orgContext,
      template: params.template,
      campaignDifficulty: params.campaignDifficulty,
      locale: params.locale,
    });
    const script = await generateVoiceScript(input);
    return { script, aiFallback: false };
  } catch (err) {
    console.error("[ai-launch] voice script fallback", err);
    return {
      script: {
        script: `[Training simulation] Caller impersonates IT support regarding ${params.template.title}.`,
        callerName: "IT Support",
        callerRole: "Help Desk",
      },
      aiFallback: true,
    };
  }
}

export async function resolveSmishingContent(params: {
  template: CampaignTemplate;
  employee: EmployeeForGeneration;
  orgContext: OrgContext | null | undefined;
  campaignDifficulty: string;
  actionUrl: string;
  locale?: string;
}): Promise<{ message: string; senderLabel: string; aiFallback: boolean }> {
  try {
    assertAiConfigured();
    const input = buildGenerationInput({
      employee: params.employee,
      orgContext: params.orgContext,
      template: params.template,
      campaignDifficulty: params.campaignDifficulty,
      locale: params.locale,
    });
    const smish = await generateSmishingMessage(input, params.actionUrl);
    return { ...smish, aiFallback: false };
  } catch {
    return {
      message: `Action required: verify your account. ${params.actionUrl}`,
      senderLabel: "ALERT",
      aiFallback: true,
    };
  }
}

/** Wrap smishing as email body for delivery until SMS provider exists */
export function smishingToEmailHtml(
  message: string,
  senderLabel: string,
  actionUrl: string,
): string {
  return `<div style="font-family:sans-serif;max-width:360px;margin:0 auto;padding:16px;">
    <p style="color:#666;font-size:12px;">Simulated SMS (delivered via email for training)</p>
    <div style="background:#f0f0f0;border-radius:12px;padding:12px;margin:8px 0;">
      <strong>${senderLabel}</strong>
      <p style="margin:8px 0 0;">${message}</p>
    </div>
    <p><a href="${actionUrl}">Open link</a></p>
  </div>`;
}
