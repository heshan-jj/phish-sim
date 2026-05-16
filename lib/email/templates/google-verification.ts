import type { EmailRenderInput, EmailTemplate } from "./types";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}

function renderPlaceholders(value: string, placeholders: Record<string, string>) {
  return value.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    return placeholders[key] ?? match;
  });
}

function renderPlainText(value: string, placeholders: Record<string, string>) {
  return escapeHtml(renderPlaceholders(value, placeholders));
}

function renderBodyParagraphs(bodyText: string, placeholders: Record<string, string>) {
  return bodyText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;color:#3c4043;font-size:14px;line-height:22px;">${renderPlainText(paragraph, placeholders).replace(/\n/g, "<br />")}</p>`,
    )
    .join("");
}

function renderGoogleVerificationEmail({ copy, placeholders }: EmailRenderInput) {
  const subject = renderPlainText(copy.subject, placeholders);
  const previewText = renderPlainText(copy.previewText, placeholders);
  const body = renderBodyParagraphs(copy.bodyText, placeholders);
  const ctaText = renderPlainText(copy.ctaText, placeholders);
  const footerText = renderPlainText(copy.footerText, placeholders);
  const actionUrl = escapeAttribute(placeholders.actionUrl ?? "#");
  const employeeEmail = renderPlainText("{{employeeEmail}}", placeholders);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background:#f8fafd;font-family:Arial,Helvetica,sans-serif;color:#202124;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${previewText}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafd;margin:0;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #dadce0;border-radius:8px;">
            <tr>
              <td style="padding:40px 40px 24px;text-align:center;border-bottom:1px solid #f1f3f4;">
                <div aria-label="Google" style="font-size:28px;line-height:34px;font-weight:500;font-family:Arial,Helvetica,sans-serif;">
                  <span style="color:#4285f4;">G</span><span style="color:#ea4335;">o</span><span style="color:#fbbc04;">o</span><span style="color:#4285f4;">g</span><span style="color:#34a853;">l</span><span style="color:#ea4335;">e</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px 8px;text-align:center;">
                <h1 style="margin:0;color:#202124;font-size:24px;font-weight:400;line-height:32px;">Verify your recovery email</h1>
                <p style="margin:12px 0 0;color:#5f6368;font-size:14px;line-height:22px;">${employeeEmail}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 8px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:8px 40px 32px;">
                <a href="${actionUrl}" style="display:inline-block;background:#1a73e8;border-radius:4px;color:#ffffff;font-size:14px;font-weight:500;line-height:20px;padding:10px 24px;text-decoration:none;">${ctaText}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 32px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #dadce0;border-radius:8px;">
                  <tr>
                    <td style="padding:16px;">
                      <p style="margin:0 0 4px;color:#202124;font-size:13px;font-weight:700;line-height:20px;">Security check details</p>
                      <p style="margin:0;color:#5f6368;font-size:13px;line-height:20px;">Account: ${employeeEmail}</p>
                      <p style="margin:0;color:#5f6368;font-size:13px;line-height:20px;">Requested by: Google Account Security</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 40px;border-top:1px solid #f1f3f4;">
                <p style="margin:0;color:#5f6368;font-size:12px;line-height:18px;text-align:center;">${footerText}</p>
              </td>
            </tr>
          </table>
          <p style="max-width:600px;margin:16px auto 0;color:#9aa0a6;font-size:11px;line-height:16px;text-align:center;">
            Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export const googleVerificationTemplate: EmailTemplate = {
  id: "google-verification",
  name: "Google Email Verification",
  description:
    "A Google account verification style email with a clean security-card layout.",
  brand: "Google",
  scenario: "account_verification",
  allowedPlaceholders: [
    "{{firstName}}",
    "{{companyName}}",
    "{{employeeEmail}}",
    "{{actionUrl}}",
    "{{expiresIn}}",
    "{{supportEmail}}",
  ],
  sampleCopy: {
    subject: "Verify your recovery email for {{companyName}}",
    previewText:
      "Confirm that {{employeeEmail}} is still available for account recovery.",
    bodyText:
      "Hi {{firstName}},\n\nWe need to confirm that {{employeeEmail}} is still available as a recovery email for your {{companyName}} Google Workspace account.\n\nThis verification helps keep access to Gmail, Drive, Calendar, and shared documents protected. The link expires in {{expiresIn}}.",
    ctaText: "Verify email",
    footerText:
      "If you did not request this message, contact {{supportEmail}} before taking action.",
  },
  samplePlaceholders: {
    firstName: "Alex",
    companyName: "Acme Corp",
    employeeEmail: "alex@acme.example",
    actionUrl: "https://training.example.com/login/google-verification",
    expiresIn: "24 hours",
    supportEmail: "it-support@acme.example",
  },
  render: renderGoogleVerificationEmail,
};
