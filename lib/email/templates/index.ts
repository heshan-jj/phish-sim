import { googleVerificationTemplate } from "./google-verification";

export type { EmailCopy, EmailRenderInput, EmailTemplate } from "./types";

export const EMAIL_TEMPLATES = [googleVerificationTemplate];

export function getEmailTemplateById(id: string) {
  return EMAIL_TEMPLATES.find((template) => template.id === id);
}
