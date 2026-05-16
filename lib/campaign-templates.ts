export type CampaignDifficulty = "Easy" | "Medium" | "Hard";
export type TemplateCategory =
  | "security"
  | "document"
  | "hr"
  | "it"
  | "social"
  | "cloud"
  | "delivery"
  | "software";
export type UrgencyLevel = "low" | "medium" | "medium-high" | "high";
export type LandingPageType =
  | "google_workspace"
  | "microsoft365"
  | "generic_sso"
  | "docusign"
  | "workday"
  | "helpdesk"
  | "vpn"
  | "teams"
  | "slack"
  | "dropbox"
  | "mfa"
  | "benefits"
  | "shipping"
  | "linkedin"
  | "software_license";

export interface CampaignTemplate {
  id: string;
  title: string;
  name: string;
  category: TemplateCategory;
  description: string;
  subject: string;
  preheader: string;
  body: string;
  buttonText: string;
  buttonColor: string;
  landingPageType: LandingPageType;
  urgencyLevel: UrgencyLevel;
  personalizationFields: string[];
  delayMin: number;
  delayMax: number;
  contentVariations: string[];
  senderName: string;
  senderEmail: string;
  tags: string[];
  difficulty: CampaignDifficulty;
  redFlags: string[];
}

export interface RenderCampaignEmailInput {
  template: CampaignTemplate;
  placeholders: Record<string, string>;
  actionUrl: string;
  variation?: string;
}

export interface RenderGeneratedCampaignEmailInput
  extends RenderCampaignEmailInput {
  subject: string;
  body: string;
  preheader?: string;
}

const PERSONALIZATION_FIELDS = [
  "{{firstName}}",
  "{{lastName}}",
  "{{department}}",
  "{{employeeId}}",
  "{{companyName}}",
];

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: "security-alert-suspicious-login",
    title: "Security Alert - Suspicious Login",
    name: "Security Alert - Suspicious Login",
    category: "security",
    description: "Unrecognized account access from an unusual location.",
    subject: "Security Alert: Unrecognized device accessed your account",
    preheader: "Login detected: {{variation}} at 3:47 AM.",
    body: "Hi {{firstName}},\n\nWe detected a login to your {{companyName}} account from an unrecognized device.\n\n{{variation}}\nIP Address: 185.220.101.47\nTime: 3:47 AM\nDevice: Windows 10, Chrome\n\nIf this wasn't you, please secure your account immediately.",
    buttonText: "Verify Account",
    buttonColor: "#dc2626",
    landingPageType: "google_workspace",
    urgencyLevel: "high",
    personalizationFields: PERSONALIZATION_FIELDS,
    delayMin: 30,
    delayMax: 300,
    contentVariations: [
      "Location: Moscow, Russia",
      "Location: Beijing, China",
      "Location: Lagos, Nigeria",
    ],
    senderName: "IT Security Team",
    senderEmail: "security-alerts@company-training.example",
    tags: ["security", "urgency", "account"],
    difficulty: "Hard",
    redFlags: [
      "The email creates pressure with an unusual-location alert.",
      "The sign-in request comes from a link in email instead of a known portal.",
      "The sender domain should be verified before entering credentials.",
    ],
  },
  {
    id: "password-expiration",
    title: "Password Expiration",
    name: "Password Expiration",
    category: "security",
    description: "IT policy notice warning that password access will expire.",
    subject: "Action Required: Your password expires in 24 hours",
    preheader: "Update your company password before access is restricted.",
    body: "Hi {{firstName}},\n\nYour {{companyName}} password is scheduled to expire in 24 hours under the current IT access policy.\n\nDepartment: {{department}}\nAccount: {{employeeEmail}}\n\nPlease confirm your current sign-in and update your password to avoid losing access to company systems.",
    buttonText: "Update Password",
    buttonColor: "#ea580c",
    landingPageType: "microsoft365",
    urgencyLevel: "medium-high",
    personalizationFields: PERSONALIZATION_FIELDS,
    delayMin: 30,
    delayMax: 300,
    contentVariations: [
      "Password expiry window: 24 hours",
      "Password expiry window: end of business day",
      "Password expiry window: next sign-in",
    ],
    senderName: "IT Service Desk",
    senderEmail: "it-service@company-training.example",
    tags: ["security", "IT", "deadline"],
    difficulty: "Medium",
    redFlags: [
      "Password changes should start from a bookmarked company portal.",
      "The message threatens account loss to hurry the recipient.",
      "The sender address is not a normal internal helpdesk mailbox.",
    ],
  },
  {
    id: "docusign-document-share",
    title: "Document Share - DocuSign",
    name: "Document Share - DocuSign",
    category: "document",
    description: "A signature request for a contract, NDA, or HR document.",
    subject: "{{firstName}}, you have a document waiting for signature",
    preheader: "Please review and sign the pending document.",
    body: "Hi {{firstName}},\n\n{{variation}} has sent you a document for review and signature.\n\nDocument: Confidential agreement\nRecipient: {{employeeEmail}}\n\nPlease sign in to review the document before it expires.",
    buttonText: "Review Document",
    buttonColor: "#4a00e0",
    landingPageType: "docusign",
    urgencyLevel: "medium",
    personalizationFields: PERSONALIZATION_FIELDS,
    delayMin: 30,
    delayMax: 300,
    contentVariations: [
      "Human Resources",
      "Legal Operations",
      "Procurement",
    ],
    senderName: "DocuSign Notifications",
    senderEmail: "documents@company-training.example",
    tags: ["document", "signature", "workflow"],
    difficulty: "Medium",
    redFlags: [
      "Unexpected signing requests should be confirmed with the sender.",
      "The email does not clearly identify why the document is expected.",
      "The link asks for login before showing document details.",
    ],
  },
  {
    id: "google-drive-confidential-share",
    title: "Document Share - Google Drive",
    name: "Document Share - Google Drive",
    category: "document",
    description: "Confidential strategy document shared through Drive.",
    subject: '{{variation}} shared "Confidential_Q4_Strategy.pdf" with you',
    preheader: "Open the shared file to view comments and access details.",
    body: "Hi {{firstName}},\n\n{{variation}} shared a confidential file with you in {{companyName}} Drive.\n\nFile: Confidential_Q4_Strategy.pdf\nAccess: Viewer\n\nSign in with your work account to view the document.",
    buttonText: "Open in Drive",
    buttonColor: "#1a73e8",
    landingPageType: "google_workspace",
    urgencyLevel: "medium",
    personalizationFields: PERSONALIZATION_FIELDS,
    delayMin: 30,
    delayMax: 300,
    contentVariations: ["Jordan Lee", "Morgan Patel", "Taylor Kim"],
    senderName: "Drive Notifications",
    senderEmail: "drive-share@company-training.example",
    tags: ["document", "cloud", "curiosity"],
    difficulty: "Hard",
    redFlags: [
      "The shared-file subject invites curiosity about confidential content.",
      "The sender should be checked against real Drive notification addresses.",
      "Unexpected confidential documents should be verified out of band.",
    ],
  },
  {
    id: "pay-stub-ready",
    title: "Payroll/HR - Pay Stub",
    name: "Payroll/HR - Pay Stub",
    category: "hr",
    description: "Monthly payroll notification for a new pay stub.",
    subject: "Your {{variation}} pay stub is ready to view",
    preheader: "Sign in to view your latest payroll statement.",
    body: "Hi {{firstName}},\n\nYour {{variation}} pay stub is now available in the employee payroll portal.\n\nFor privacy, payroll documents require company SSO before viewing.\n\nPlease sign in to review your statement.",
    buttonText: "View Pay Stub",
    buttonColor: "#0875e1",
    landingPageType: "workday",
    urgencyLevel: "medium",
    personalizationFields: PERSONALIZATION_FIELDS,
    delayMin: 30,
    delayMax: 300,
    contentVariations: ["December", "January", "latest"],
    senderName: "Payroll Services",
    senderEmail: "payroll@company-training.example",
    tags: ["HR", "payroll", "routine"],
    difficulty: "Easy",
    redFlags: [
      "Payroll links should be opened from the official HR portal.",
      "Payroll messages can use routine timing to lower suspicion.",
      "The sender address should match the company's real payroll domain.",
    ],
  },
  {
    id: "w2-tax-forms",
    title: "Payroll/HR - W2/Tax Forms",
    name: "Payroll/HR - W2/Tax Forms",
    category: "hr",
    description: "Tax-season notice for W-2 availability.",
    subject: "Your 2024 W-2 is now available",
    preheader: "Download your tax form before the filing deadline.",
    body: "Hi {{firstName}},\n\nYour 2024 W-2 tax form is now available for download.\n\nEmployee ID: {{employeeId}}\nDepartment: {{department}}\n\nPlease sign in to the payroll portal to download your secure tax document.",
    buttonText: "Download W-2",
    buttonColor: "#0875e1",
    landingPageType: "workday",
    urgencyLevel: "high",
    personalizationFields: PERSONALIZATION_FIELDS,
    delayMin: 30,
    delayMax: 300,
    contentVariations: [
      "Tax form delivery deadline: January 31",
      "Electronic tax form delivery enabled",
      "Payroll records require SSO verification",
    ],
    senderName: "Payroll Tax Forms",
    senderEmail: "tax-documents@company-training.example",
    tags: ["HR", "tax", "seasonal"],
    difficulty: "Medium",
    redFlags: [
      "Tax forms are sensitive and should be accessed from known bookmarks.",
      "Seasonal deadlines can be used to rush decisions.",
      "Unexpected tax-form messages should be verified with HR.",
    ],
  },
  {
    id: "helpdesk-ticket-update",
    title: "IT Helpdesk - Ticket Update",
    name: "IT Helpdesk - Ticket Update",
    category: "it",
    description: "A closed support ticket that asks for review.",
    subject: "Ticket #84729: Issue Resolved - Review Required",
    preheader: "Confirm the resolution in the support portal.",
    body: "Hi {{firstName}},\n\nTicket #84729 has been marked resolved by the {{companyName}} IT Helpdesk.\n\nResolution note: {{variation}}\n\nPlease sign in to confirm whether this issue is fully resolved.",
    buttonText: "Review Ticket",
    buttonColor: "#2563eb",
    landingPageType: "helpdesk",
    urgencyLevel: "low",
    personalizationFields: PERSONALIZATION_FIELDS,
    delayMin: 30,
    delayMax: 300,
    contentVariations: [
      "Account access restored",
      "Device policy sync completed",
      "Mailbox configuration updated",
    ],
    senderName: "IT Helpdesk",
    senderEmail: "helpdesk@company-training.example",
    tags: ["IT", "routine", "ticket"],
    difficulty: "Easy",
    redFlags: [
      "Unexpected ticket updates should match a ticket you opened.",
      "Helpdesk portals should be accessed from the official intranet.",
      "The message lacks clear context about the original issue.",
    ],
  },
  {
    id: "vpn-certificate-expiration",
    title: "VPN/Network Access",
    name: "VPN/Network Access",
    category: "it",
    description: "Remote access warning for an expiring VPN certificate.",
    subject: "Your VPN certificate expires today",
    preheader: "Renew your certificate to keep remote access active.",
    body: "Hi {{firstName}},\n\nYour VPN certificate for {{companyName}} remote access expires today.\n\nAffected service: {{variation}}\nDepartment: {{department}}\n\nRenew now to avoid interruption to network and application access.",
    buttonText: "Renew VPN Access",
    buttonColor: "#dc2626",
    landingPageType: "vpn",
    urgencyLevel: "high",
    personalizationFields: PERSONALIZATION_FIELDS,
    delayMin: 30,
    delayMax: 300,
    contentVariations: [
      "Cisco AnyConnect",
      "GlobalProtect VPN",
      "Remote Access Gateway",
    ],
    senderName: "Network Access Team",
    senderEmail: "vpn-support@company-training.example",
    tags: ["IT", "VPN", "deadline"],
    difficulty: "Hard",
    redFlags: [
      "Certificate renewals should be started from device management or IT docs.",
      "The email uses access loss as pressure.",
      "VPN credential prompts from links should be treated with caution.",
    ],
  },
  {
    id: "teams-slack-executive-message",
    title: "Microsoft Teams/Slack Message",
    name: "Microsoft Teams/Slack Message",
    category: "social",
    description: "Unread messages from a senior leader.",
    subject: "You have 3 unread messages from {{variation}}",
    preheader: "Sign in to view the missed conversation.",
    body: "Hi {{firstName}},\n\nYou have 3 unread messages from {{variation}} waiting in your workspace.\n\nThe conversation was marked important and includes a direct mention for {{department}}.\n\nSign in to view the messages.",
    buttonText: "View Messages",
    buttonColor: "#6264a7",
    landingPageType: "teams",
    urgencyLevel: "high",
    personalizationFields: PERSONALIZATION_FIELDS,
    delayMin: 30,
    delayMax: 300,
    contentVariations: ["the CEO", "the VP of Operations", "the Finance Director"],
    senderName: "Teams Notifications",
    senderEmail: "messages@company-training.example",
    tags: ["authority", "messages", "social"],
    difficulty: "Hard",
    redFlags: [
      "Authority cues can make a message feel more urgent than it is.",
      "Open Teams or Slack directly instead of following sign-in links.",
      "Notification sender domains should match the real service.",
    ],
  },
  {
    id: "dropbox-storage-full",
    title: "Cloud Storage - Dropbox",
    name: "Cloud Storage - Dropbox",
    category: "cloud",
    description: "Storage quota warning asking the user to sign in.",
    subject: "Your Dropbox storage is 98% full",
    preheader: "Review storage usage to avoid sync interruptions.",
    body: "Hi {{firstName}},\n\nYour Dropbox storage for {{companyName}} is {{variation}} full.\n\nFile syncing may pause if storage is not reviewed.\n\nPlease sign in to view large files and available options.",
    buttonText: "Review Storage",
    buttonColor: "#0061ff",
    landingPageType: "dropbox",
    urgencyLevel: "medium",
    personalizationFields: PERSONALIZATION_FIELDS,
    delayMin: 30,
    delayMax: 300,
    contentVariations: ["98%", "96%", "nearly"],
    senderName: "Dropbox Storage",
    senderEmail: "storage-alerts@company-training.example",
    tags: ["cloud", "quota", "routine"],
    difficulty: "Easy",
    redFlags: [
      "Quota warnings should be checked inside the storage app.",
      "The sender address should match the real vendor domain.",
      "Storage-pressure messages can push quick clicks.",
    ],
  },
  {
    id: "mfa-setup-required",
    title: "Multi-Factor Authentication",
    name: "Multi-Factor Authentication",
    category: "security",
    description: "Company MFA enrollment deadline.",
    subject: "MFA Setup Required: Secure your account by Friday",
    preheader: "MFA enrollment is required for continued account access.",
    body: "Hi {{firstName}},\n\n{{companyName}} is requiring multi-factor authentication for all employees.\n\nStatus: Enrollment pending\nDeadline: {{variation}}\n\nPlease sign in to complete MFA setup for your account.",
    buttonText: "Set Up MFA",
    buttonColor: "#2563eb",
    landingPageType: "mfa",
    urgencyLevel: "medium",
    personalizationFields: PERSONALIZATION_FIELDS,
    delayMin: 30,
    delayMax: 300,
    contentVariations: ["Friday at 5 PM", "end of week", "your next sign-in"],
    senderName: "Identity Security",
    senderEmail: "mfa-enrollment@company-training.example",
    tags: ["security", "MFA", "policy"],
    difficulty: "Medium",
    redFlags: [
      "MFA enrollment should be verified through known identity portals.",
      "Security policy messages are common phishing lures.",
      "A credential prompt before MFA setup is suspicious.",
    ],
  },
  {
    id: "benefits-open-enrollment",
    title: "Benefits Enrollment",
    name: "Benefits Enrollment",
    category: "hr",
    description: "Annual benefits deadline notice.",
    subject: "Open Enrollment ends in 48 hours",
    preheader: "Review your benefits selections before the deadline.",
    body: "Hi {{firstName}},\n\nOpen Enrollment for {{companyName}} benefits ends in 48 hours.\n\nCurrent status: {{variation}}\n\nPlease sign in to confirm your benefits elections before the enrollment window closes.",
    buttonText: "Review Benefits",
    buttonColor: "#0f766e",
    landingPageType: "benefits",
    urgencyLevel: "high",
    personalizationFields: PERSONALIZATION_FIELDS,
    delayMin: 30,
    delayMax: 300,
    contentVariations: [
      "No selections submitted",
      "Dependent details incomplete",
      "Plan confirmation pending",
    ],
    senderName: "Benefits Center",
    senderEmail: "benefits@company-training.example",
    tags: ["HR", "benefits", "deadline"],
    difficulty: "Medium",
    redFlags: [
      "Deadline pressure is a common social engineering tactic.",
      "Benefits changes should start from the official HR system.",
      "The email asks for sign-in before showing specific details.",
    ],
  },
  {
    id: "package-delivery-failed",
    title: "Package Delivery",
    name: "Package Delivery",
    category: "delivery",
    description: "Failed delivery notice with rescheduling request.",
    subject: "Package delivery failed - Action required",
    preheader: "Reschedule delivery to avoid return to sender.",
    body: "Hi {{firstName}},\n\nWe were unable to complete delivery for a package addressed to {{companyName}}.\n\nCarrier note: {{variation}}\n\nPlease verify delivery details to reschedule.",
    buttonText: "Reschedule Delivery",
    buttonColor: "#7c3aed",
    landingPageType: "shipping",
    urgencyLevel: "medium",
    personalizationFields: PERSONALIZATION_FIELDS,
    delayMin: 30,
    delayMax: 300,
    contentVariations: [
      "Recipient unavailable",
      "Address confirmation required",
      "Delivery window missed",
    ],
    senderName: "Delivery Support",
    senderEmail: "tracking@company-training.example",
    tags: ["delivery", "routine", "action"],
    difficulty: "Easy",
    redFlags: [
      "Unexpected delivery emails should be checked with the carrier directly.",
      "Generic package notices often hide suspicious links.",
      "The sender does not include a recognizable tracking domain.",
    ],
  },
  {
    id: "linkedin-profile-searches",
    title: "LinkedIn/Social",
    name: "LinkedIn/Social",
    category: "social",
    description: "Professional curiosity lure about profile views.",
    subject: "You appeared in 12 searches this week",
    preheader: "See who viewed your professional profile.",
    body: "Hi {{firstName}},\n\nYour profile appeared in {{variation}} searches this week.\n\nSeveral viewers are connected to {{department}} roles and open opportunities.\n\nSign in to see who's been viewing your profile.",
    buttonText: "See Search Appearances",
    buttonColor: "#0a66c2",
    landingPageType: "linkedin",
    urgencyLevel: "low",
    personalizationFields: PERSONALIZATION_FIELDS,
    delayMin: 30,
    delayMax: 300,
    contentVariations: ["12", "9", "15"],
    senderName: "Professional Network Updates",
    senderEmail: "updates@company-training.example",
    tags: ["social", "curiosity", "profile"],
    difficulty: "Easy",
    redFlags: [
      "Curiosity lures encourage clicks without business need.",
      "Social notifications should be opened from the app directly.",
      "The sender is not clearly tied to the real platform domain.",
    ],
  },
  {
    id: "software-license-expiring",
    title: "Software License",
    name: "Software License",
    category: "software",
    description: "License renewal warning for a business application.",
    subject: "Your {{variation}} license expires tomorrow",
    preheader: "Renew access to avoid disruption to your work.",
    body: "Hi {{firstName}},\n\nYour {{variation}} license assigned to {{employeeEmail}} expires tomorrow.\n\nContinued access requires account confirmation through the license portal.\n\nPlease sign in to keep the application active.",
    buttonText: "Renew License",
    buttonColor: "#111827",
    landingPageType: "software_license",
    urgencyLevel: "high",
    personalizationFields: PERSONALIZATION_FIELDS,
    delayMin: 30,
    delayMax: 300,
    contentVariations: ["Adobe", "Microsoft 365", "Creative Cloud"],
    senderName: "Software Asset Management",
    senderEmail: "licenses@company-training.example",
    tags: ["software", "license", "deadline"],
    difficulty: "Medium",
    redFlags: [
      "Software renewals should be verified with IT or procurement.",
      "The message threatens loss of work tools to create urgency.",
      "A license portal should not require credentials from an email link.",
    ],
  },
];

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

export function getTemplateById(id: string): CampaignTemplate | undefined {
  return CAMPAIGN_TEMPLATES.find((template) => template.id === id);
}

export function getTemplateDisplayName(id: string) {
  return getTemplateById(id)?.title ?? id;
}

export function pickTemplateVariation(template: CampaignTemplate) {
  const index = Math.floor(Math.random() * template.contentVariations.length);
  return template.contentVariations[index] ?? "";
}

export function personalizeText(
  value: string,
  placeholders: Record<string, string>,
) {
  return value.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    return placeholders[key] ?? match;
  });
}

function renderBodyParagraphs(body: string, placeholders: Record<string, string>) {
  return body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const safeParagraph = escapeHtml(personalizeText(paragraph, placeholders));
      return `<p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:22px;">${safeParagraph.replace(/\n/g, "<br />")}</p>`;
    })
    .join("");
}

function renderEmailShell({
  subject,
  preheader,
  bodyHtml,
  buttonText,
  buttonColor,
  actionUrl,
  companyName,
  employeeEmail,
}: {
  subject: string;
  preheader: string;
  bodyHtml: string;
  buttonText: string;
  buttonColor: string;
  actionUrl: string;
  companyName: string;
  employeeEmail: string;
}) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;margin:0;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 20px;border-bottom:1px solid #eef2f7;">
                <p style="margin:0;color:#64748b;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">${companyName}</p>
                <h1 style="margin:10px 0 0;color:#0f172a;font-size:22px;line-height:30px;font-weight:700;">${subject}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 12px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td align="left" style="padding:8px 32px 32px;">
                <a href="${actionUrl}" style="display:inline-block;background:${buttonColor};border-radius:8px;color:#ffffff;font-size:14px;font-weight:700;line-height:20px;padding:12px 20px;text-decoration:none;">${buttonText}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;border-top:1px solid #eef2f7;">
                <p style="margin:0;color:#64748b;font-size:12px;line-height:18px;">This automated notification was sent to ${employeeEmail}.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function renderCampaignEmail({
  template,
  placeholders,
  actionUrl,
  variation,
}: RenderCampaignEmailInput) {
  const mergedPlaceholders: Record<string, string> = {
    ...placeholders,
    variation: variation ?? template.contentVariations[0] ?? "",
  };
  const subject = escapeHtml(personalizeText(template.subject, mergedPlaceholders));
  const preheader = escapeHtml(
    personalizeText(template.preheader, mergedPlaceholders),
  );

  return renderEmailShell({
    subject,
    preheader,
    bodyHtml: renderBodyParagraphs(template.body, mergedPlaceholders),
    buttonText: escapeHtml(template.buttonText),
    buttonColor: escapeAttribute(template.buttonColor),
    actionUrl: escapeAttribute(actionUrl),
    companyName: escapeHtml(mergedPlaceholders.companyName ?? "your company"),
    employeeEmail: escapeHtml(
      mergedPlaceholders.employeeEmail ?? "your work email",
    ),
  });
}

export function renderGeneratedCampaignEmail({
  template,
  placeholders,
  actionUrl,
  variation,
  subject,
  body,
  preheader,
}: RenderGeneratedCampaignEmailInput) {
  const mergedPlaceholders: Record<string, string> = {
    ...placeholders,
    variation: variation ?? template.contentVariations[0] ?? "",
  };

  return renderEmailShell({
    subject: escapeHtml(personalizeText(subject, mergedPlaceholders)),
    preheader: escapeHtml(
      personalizeText(preheader ?? template.preheader, mergedPlaceholders),
    ),
    bodyHtml: renderBodyParagraphs(body, mergedPlaceholders),
    buttonText: escapeHtml(template.buttonText),
    buttonColor: escapeAttribute(template.buttonColor),
    actionUrl: escapeAttribute(actionUrl),
    companyName: escapeHtml(mergedPlaceholders.companyName ?? "your company"),
    employeeEmail: escapeHtml(
      mergedPlaceholders.employeeEmail ?? "your work email",
    ),
  });
}
