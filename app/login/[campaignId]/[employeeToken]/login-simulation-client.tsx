"use client";

import { type FormEvent, type ReactElement, useMemo, useState } from "react";

type LoginVariant = "microsoft365" | "workday" | "docusign" | "slack";

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
};

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
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const theme = THEMES[variant];
  const displayRedFlags = useMemo(() => redFlags.slice(0, 5), [redFlags]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await fetch(
        `/api/track?token=${encodeURIComponent(token)}&action=credential_attempted`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            action: "credential_attempted",
            metadata: {
              campaignId,
              email: email.trim(),
              passwordLength: password.length,
            },
          }),
        },
      );
    } finally {
      setSubmitting(false);
      setShowModal(true);
    }
  }

  return (
    <div className={`flex min-h-screen items-center justify-center px-4 ${theme.pageBg}`}>
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
            placeholder={
              variant === "slack" ? "name@company.com" : "Email, phone, or Skype"
            }
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
