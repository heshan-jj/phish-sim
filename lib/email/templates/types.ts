export interface EmailCopy {
  subject: string;
  previewText: string;
  bodyText: string;
  ctaText: string;
  footerText: string;
}

export interface EmailRenderInput {
  copy: EmailCopy;
  placeholders: Record<string, string>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  brand: string;
  scenario: string;
  allowedPlaceholders: string[];
  sampleCopy: EmailCopy;
  samplePlaceholders: Record<string, string>;
  render: (input: EmailRenderInput) => string;
}
