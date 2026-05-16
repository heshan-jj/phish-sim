import type { LandingPageType } from "@/lib/campaign-templates";

export const VARIANT_META: Record<
  LandingPageType,
  { documentTitle: string; accentClass: string; buttonClass: string }
> = {
  google_workspace: {
    documentTitle: "Sign in - Google Accounts",
    accentClass: "text-[#1a73e8]",
    buttonClass: "bg-[#1a73e8] hover:bg-[#1765cc]",
  },
  microsoft365: {
    documentTitle: "Sign in to your account",
    accentClass: "text-[#0067b8]",
    buttonClass: "bg-[#0067b8] hover:bg-[#005da6]",
  },
  generic_sso: {
    documentTitle: "Sign in - Company SSO",
    accentClass: "text-[#2563eb]",
    buttonClass: "bg-[#2563eb] hover:bg-[#1d4ed8]",
  },
  workday: {
    documentTitle: "Sign In - Workday",
    accentClass: "text-[#f36f21]",
    buttonClass: "bg-[#f36f21] hover:bg-[#e0651a]",
  },
  docusign: {
    documentTitle: "DocuSign Login",
    accentClass: "text-[#4a00e0]",
    buttonClass: "bg-[#4a00e0] hover:bg-[#3e00bf]",
  },
  helpdesk: {
    documentTitle: "IT Helpdesk Portal",
    accentClass: "text-[#2563eb]",
    buttonClass: "bg-[#2563eb] hover:bg-[#1d4ed8]",
  },
  vpn: {
    documentTitle: "VPN Portal",
    accentClass: "text-[#dc2626]",
    buttonClass: "bg-[#dc2626] hover:bg-[#b91c1c]",
  },
  teams: {
    documentTitle: "Sign in - Microsoft Teams",
    accentClass: "text-[#6264a7]",
    buttonClass: "bg-[#6264a7] hover:bg-[#53559a]",
  },
  slack: {
    documentTitle: "Sign in - Slack",
    accentClass: "text-[#611f69]",
    buttonClass: "bg-[#611f69] hover:bg-[#4e1754]",
  },
  dropbox: {
    documentTitle: "Sign in - Dropbox",
    accentClass: "text-[#0061ff]",
    buttonClass: "bg-[#0061ff] hover:bg-[#0052d9]",
  },
  mfa: {
    documentTitle: "Multi-factor authentication",
    accentClass: "text-[#2563eb]",
    buttonClass: "bg-[#2563eb] hover:bg-[#1d4ed8]",
  },
  benefits: {
    documentTitle: "Benefits Enrollment",
    accentClass: "text-[#0f766e]",
    buttonClass: "bg-[#0f766e] hover:bg-[#0d5f59]",
  },
  shipping: {
    documentTitle: "Delivery Verification",
    accentClass: "text-[#7c3aed]",
    buttonClass: "bg-[#7c3aed] hover:bg-[#6d28d9]",
  },
  linkedin: {
    documentTitle: "Sign in - LinkedIn",
    accentClass: "text-[#0a66c2]",
    buttonClass: "bg-[#0a66c2] hover:bg-[#084f96]",
  },
  software_license: {
    documentTitle: "Software License Portal",
    accentClass: "text-[#111827]",
    buttonClass: "bg-[#111827] hover:bg-[#374151]",
  },
};
