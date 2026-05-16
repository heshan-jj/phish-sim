"use client";

import type { LandingPageType } from "@/lib/campaign-templates";
import { type FormEvent, type ReactElement, useEffect, useMemo, useState } from "react";

type LoginVariant = LandingPageType;

interface LoginSimulationClientProps {
  token: string;
  campaignId: string;
  variant: LoginVariant;
  senderName: string;
  senderEmail: string;
  subject: string;
  redFlags: string[];
  clickRate: number;
}

type BrandTheme = {
  name: string;
  pageBg: string;
  panelBg: string;
  title: string;
  subtitle: string;
  submitLabel: string;
  helpLabel: string;
  accentClass: string;
  buttonClass: string;
  logo: ReactElement;
};

function MicrosoftLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <rect x="1" y="1" width="10" height="10" fill="#f25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7fba00" />
      <rect x="1" y="13" width="10" height="10" fill="#00a4ef" />
      <rect x="13" y="13" width="10" height="10" fill="#ffb900" />
    </svg>
  );
}

function GoogleWorkspaceLogo() {
  return (
    <div
      className="flex size-8 items-center justify-center rounded-full border border-[#dadce0] text-lg font-semibold text-[#1a73e8]"
      aria-hidden
    >
      G
    </div>
  );
}

function GenericLogo({ label }: { label: string }) {
  return (
    <div
      className="flex size-8 items-center justify-center rounded-md bg-slate-900 text-xs font-semibold text-white"
      aria-hidden
    >
      {label.slice(0, 2).toUpperCase()}
    </div>
  );
}

function WorkdayLogo() {
  return (
    <svg viewBox="0 0 120 30" className="h-7 w-[120px]" aria-hidden>
      <path d="M14 20a16 16 0 0 1 32 0" fill="none" stroke="#f36f21" strokeWidth="4" />
      <text x="54" y="21" fill="#1f3b63" fontSize="14" fontFamily="Arial, sans-serif">
        workday
      </text>
    </svg>
  );
}

function DocusignLogo() {
  return (
    <svg viewBox="0 0 170 32" className="h-7 w-[170px]" aria-hidden>
      <text x="0" y="24" fill="#4a00e0" fontSize="26" fontFamily="Arial, sans-serif">
        Docusign
      </text>
    </svg>
  );
}

function SlackLogo() {
  return (
    <svg viewBox="0 0 44 44" className="h-7 w-7" aria-hidden>
      <rect x="18" y="2" width="8" height="18" rx="4" fill="#36C5F0" />
      <rect x="24" y="18" width="18" height="8" rx="4" fill="#2EB67D" />
      <rect x="18" y="24" width="8" height="18" rx="4" fill="#ECB22E" />
      <rect x="2" y="18" width="18" height="8" rx="4" fill="#E01E5A" />
    </svg>
  );
}

const THEMES: Record<LoginVariant, BrandTheme> = {
  google_workspace: {
    name: "Google Workspace",
    pageBg: "bg-[#f8fafd]",
    panelBg: "bg-white",
    title: "Sign in",
    subtitle: "to continue to your account",
    submitLabel: "Next",
    helpLabel: "Forgot email?",
    accentClass: "text-[#1a73e8]",
    buttonClass: "bg-[#1a73e8] hover:bg-[#1765cc]",
    logo: <GoogleWorkspaceLogo />,
  },
  microsoft365: {
    name: "Microsoft 365",
    pageBg: "bg-[#f3f3f3]",
    panelBg: "bg-white",
    title: "Sign in",
    subtitle: "Use your Microsoft account",
    submitLabel: "Sign in",
    helpLabel: "Forgot my password",
    accentClass: "text-[#0067b8]",
    buttonClass: "bg-[#0067b8] hover:bg-[#005da6]",
    logo: <MicrosoftLogo />,
  },
  generic_sso: {
    name: "Company SSO",
    pageBg: "bg-[#f5f7fb]",
    panelBg: "bg-white",
    title: "Sign in",
    subtitle: "Use your organization account",
    submitLabel: "Continue",
    helpLabel: "Need help signing in?",
    accentClass: "text-[#2563eb]",
    buttonClass: "bg-[#2563eb] hover:bg-[#1d4ed8]",
    logo: <GenericLogo label="SSO" />,
  },
  workday: {
    name: "Workday",
    pageBg: "bg-[#eef3f7]",
    panelBg: "bg-white",
    title: "Sign In to Workday",
    subtitle: "Use your organization account",
    submitLabel: "Sign In",
    helpLabel: "Need help signing in?",
    accentClass: "text-[#f36f21]",
    buttonClass: "bg-[#0875e1] hover:bg-[#0668c8]",
    logo: <WorkdayLogo />,
  },
  docusign: {
    name: "DocuSign",
    pageBg: "bg-[#f7f8fc]",
    panelBg: "bg-white",
    title: "Sign in",
    subtitle: "to continue to DocuSign",
    submitLabel: "LOG IN",
    helpLabel: "Can't access your account?",
    accentClass: "text-[#4a00e0]",
    buttonClass: "bg-[#4a00e0] hover:bg-[#3e00bf]",
    logo: <DocusignLogo />,
  },
  helpdesk: {
    name: "IT Helpdesk",
    pageBg: "bg-[#f4f7fb]",
    panelBg: "bg-white",
    title: "Helpdesk Portal",
    subtitle: "Sign in to review your ticket",
    submitLabel: "Review Ticket",
    helpLabel: "Contact support",
    accentClass: "text-[#2563eb]",
    buttonClass: "bg-[#2563eb] hover:bg-[#1d4ed8]",
    logo: <GenericLogo label="HD" />,
  },
  vpn: {
    name: "VPN Portal",
    pageBg: "bg-[#f8fafc]",
    panelBg: "bg-white",
    title: "Remote Access",
    subtitle: "Renew your VPN certificate",
    submitLabel: "Renew Access",
    helpLabel: "Need VPN help?",
    accentClass: "text-[#dc2626]",
    buttonClass: "bg-[#dc2626] hover:bg-[#b91c1c]",
    logo: <GenericLogo label="VPN" />,
  },
  teams: {
    name: "Microsoft Teams",
    pageBg: "bg-[#f5f5fb]",
    panelBg: "bg-white",
    title: "Sign in to Teams",
    subtitle: "View your unread messages",
    submitLabel: "Sign in",
    helpLabel: "Can't access Teams?",
    accentClass: "text-[#6264a7]",
    buttonClass: "bg-[#6264a7] hover:bg-[#53559a]",
    logo: <GenericLogo label="TM" />,
  },
  slack: {
    name: "Slack",
    pageBg: "bg-[#f8f8f8]",
    panelBg: "bg-white",
    title: "Sign in to Slack",
    subtitle: "Enter your workspace credentials",
    submitLabel: "Sign In With Email",
    helpLabel: "Forgot your password?",
    accentClass: "text-[#611f69]",
    buttonClass: "bg-[#611f69] hover:bg-[#4e1754]",
    logo: <SlackLogo />,
  },
  dropbox: {
    name: "Dropbox",
    pageBg: "bg-[#f7faff]",
    panelBg: "bg-white",
    title: "Sign in",
    subtitle: "to review your storage",
    submitLabel: "Sign in",
    helpLabel: "Forgot password?",
    accentClass: "text-[#0061ff]",
    buttonClass: "bg-[#0061ff] hover:bg-[#0052d9]",
    logo: <GenericLogo label="DB" />,
  },
  mfa: {
    name: "MFA Enrollment",
    pageBg: "bg-[#f8fafc]",
    panelBg: "bg-white",
    title: "Secure your account",
    subtitle: "Sign in to complete MFA setup",
    submitLabel: "Continue",
    helpLabel: "Use another method",
    accentClass: "text-[#2563eb]",
    buttonClass: "bg-[#2563eb] hover:bg-[#1d4ed8]",
    logo: <GenericLogo label="MFA" />,
  },
  benefits: {
    name: "Benefits Portal",
    pageBg: "bg-[#f3fbfa]",
    panelBg: "bg-white",
    title: "Benefits Sign In",
    subtitle: "Review your enrollment",
    submitLabel: "Sign In",
    helpLabel: "Need benefits help?",
    accentClass: "text-[#0f766e]",
    buttonClass: "bg-[#0f766e] hover:bg-[#0d5f59]",
    logo: <GenericLogo label="BN" />,
  },
  shipping: {
    name: "Delivery Portal",
    pageBg: "bg-[#faf7ff]",
    panelBg: "bg-white",
    title: "Delivery Verification",
    subtitle: "Sign in to reschedule delivery",
    submitLabel: "Continue",
    helpLabel: "Track another package",
    accentClass: "text-[#7c3aed]",
    buttonClass: "bg-[#7c3aed] hover:bg-[#6d28d9]",
    logo: <GenericLogo label="DL" />,
  },
  linkedin: {
    name: "Professional Network",
    pageBg: "bg-[#f3f7fb]",
    panelBg: "bg-white",
    title: "Sign in",
    subtitle: "to view profile activity",
    submitLabel: "Sign in",
    helpLabel: "Forgot password?",
    accentClass: "text-[#0a66c2]",
    buttonClass: "bg-[#0a66c2] hover:bg-[#084f96]",
    logo: <GenericLogo label="IN" />,
  },
  software_license: {
    name: "License Portal",
    pageBg: "bg-[#f8fafc]",
    panelBg: "bg-white",
    title: "Software License",
    subtitle: "Sign in to renew access",
    submitLabel: "Renew License",
    helpLabel: "Contact software support",
    accentClass: "text-[#111827]",
    buttonClass: "bg-[#111827] hover:bg-[#374151]",
    logo: <GenericLogo label="SW" />,
  },
};

function emailPlaceholder(variant: LoginVariant) {
  if (variant === "microsoft365") return "Email, phone, or Skype";
  if (variant === "slack") return "name@company.com";
  return "Work email";
}

export function LoginSimulationClient({
  token,
  campaignId,
  variant,
  senderName,
  senderEmail,
  subject,
  redFlags,
  clickRate,
}: LoginSimulationClientProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [startedAt] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const theme = THEMES[variant];
  const displayRedFlags = useMemo(() => redFlags.slice(0, 5), [redFlags]);

  useEffect(() => {
    void fetch(
      `/api/track?token=${encodeURIComponent(token)}&action=landing_page_viewed`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          action: "landing_page_viewed",
          metadata: { campaignId, landingPageType: variant },
        }),
      },
    );
  }, [campaignId, token, variant]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await fetch(
        `/api/track?token=${encodeURIComponent(token)}&action=credentials_submitted`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            action: "credentials_submitted",
            metadata: {
              campaignId,
              enteredEmail: email.trim().length > 0,
              enteredPassword: password.length > 0,
              timeToSubmit: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
            },
          }),
        },
      );
    } finally {
      setSubmitting(false);
      setShowModal(true);
      void fetch(
        `/api/track?token=${encodeURIComponent(token)}&action=training_viewed`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            action: "training_viewed",
            metadata: { campaignId },
          }),
        },
      );
    }
  }

  return (
    <div className={`flex min-h-dvh items-center justify-center px-4 ${theme.pageBg}`}>
      <div className="w-full max-w-[420px] rounded-md border border-black/10 bg-white/80 p-8 shadow-xl backdrop-blur-sm">
        <div className="mb-8 flex items-center gap-3">
          {theme.logo}
          <p className="text-sm font-medium text-black/70">{theme.name}</p>
        </div>

        <h1 className="text-[30px] font-semibold text-[#1b1b1b]">{theme.title}</h1>
        <p className="mt-1 text-sm text-black/60">{theme.subtitle}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={emailPlaceholder(variant)}
            className="h-11 w-full rounded border border-[#c7c7c7] bg-white px-3 text-sm outline-none ring-0 transition focus:border-[#005fb8] focus:shadow-[0_0_0_1px_#005fb8]"
          />
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={
              variant === "workday" ? "Password" : "Enter password"
            }
            className="h-11 w-full rounded border border-[#c7c7c7] bg-white px-3 text-sm outline-none ring-0 transition focus:border-[#005fb8] focus:shadow-[0_0_0_1px_#005fb8]"
          />
          <button
            type="submit"
            disabled={submitting}
            className={`h-11 w-full rounded text-sm font-semibold text-white transition disabled:opacity-70 ${theme.buttonClass}`}
          >
            {submitting ? "Submitting..." : theme.submitLabel}
          </button>
        </form>

        <button
          type="button"
          className={`mt-4 text-sm font-medium ${theme.accentClass} hover:underline`}
        >
          {theme.helpLabel}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4">
          <div className={`w-full max-w-xl rounded-xl ${theme.panelBg} p-6 shadow-2xl`}>
            <h2 className="text-2xl font-semibold text-[#151515]">
              This was a phishing simulation
            </h2>
            <p className="mt-2 text-sm text-black/70">
              You reached a safe training page. No credentials were stored.
            </p>

            <div className="mt-5 rounded-lg border border-black/10 bg-black/[0.02] p-4 text-sm">
              <p>
                <span className="font-semibold">Original sender:</span> {senderName} (
                {senderEmail})
              </p>
              <p className="mt-1">
                <span className="font-semibold">Original subject:</span> {subject}
              </p>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-black">Red flags in the email</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-black/80">
                {displayRedFlags.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            </div>

            <p className="mt-5 text-sm text-black/80">
              You&apos;re not alone — {clickRate}% of employees click on emails like this.
            </p>
            <a
              href="/security-tips"
              className={`mt-4 inline-block text-sm font-semibold ${theme.accentClass} hover:underline`}
            >
              Learn more
            </a>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className={`rounded px-4 py-2 text-sm font-medium text-white ${theme.buttonClass}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
