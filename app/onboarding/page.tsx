"use client";

import {
  ensureOrgForUser,
  markOnboardingComplete,
  saveContext,
  saveStep1,
  type OrgContext,
} from "@/app/onboarding/_actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Retail",
  "Education",
  "Manufacturing",
  "Legal",
  "Media & Entertainment",
  "Other",
];

const TOTAL_STEPS = 3;

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const step = i + 1;
        const isComplete = step < current;
        const isActive = step === current;

        return (
          <div key={step} className="flex items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-[600] transition-colors"
              style={{
                backgroundColor: isActive
                  ? "var(--ds-primary)"
                  : isComplete
                    ? "var(--ds-primary)"
                    : "var(--ds-hairline)",
                color:
                  isActive || isComplete ? "#ffffff" : "var(--ds-stone)",
              }}
            >
              {isComplete ? <CheckCircle2 size={14} /> : step}
            </div>
            {step < TOTAL_STEPS && (
              <div
                className="w-16 h-px transition-colors"
                style={{
                  backgroundColor: isComplete
                    ? "var(--ds-primary)"
                    : "var(--ds-hairline)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepLabel({ step }: { step: number }) {
  const labels = [
    "Company details",
    "Company context",
    "Review & finish",
  ];
  return (
    <p
      className="text-center text-[13px] font-[500] mb-6 -mt-4"
      style={{ color: "var(--ds-stone)" }}
    >
      Step {step} of {TOTAL_STEPS} — {labels[step - 1]}
    </p>
  );
}

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [orgId, setOrgId] = useState<string>("");
  const [orgLoading, setOrgLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 state
  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2 state
  const [vendors, setVendors] = useState("");
  const [terminology, setTerminology] = useState("");
  const [events, setEvents] = useState("");
  const [orgStructure, setOrgStructure] = useState("");

  function applyOrg(org: NonNullable<Awaited<ReturnType<typeof ensureOrgForUser>>>) {
    setOrgId(org.id);
    setOrgName(org.name ?? "");
    setIndustry(org.industry ?? "");
    setLogoUrl(org.logoUrl ?? null);

    const ctx = org.context as OrgContext | null;
    if (ctx) {
      setVendors(ctx.vendors ?? "");
      setTerminology(ctx.terminology ?? "");
      setEvents(ctx.events ?? "");
      setOrgStructure(ctx.orgStructure ?? "");
    }
  }

  // Load org on mount (create if missing so Continue is never a silent no-op)
  useEffect(() => {
    let cancelled = false;

    ensureOrgForUser()
      .then((org) => {
        if (cancelled) return;
        if (!org) {
          setError("Please sign in to continue onboarding.");
          return;
        }
        applyOrg(org);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load your workspace. Please refresh and try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setOrgLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function resolveOrgId(): Promise<string | null> {
    if (orgId) return orgId;

    const org = await ensureOrgForUser(orgName || "My Organization");
    if (!org) {
      setError("Please sign in to continue onboarding.");
      return null;
    }

    applyOrg(org);
    return org.id;
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  }

  async function handleStep1Next() {
    setLoading(true);
    setError(null);

    try {
      const id = await resolveOrgId();
      if (!id) return;

      await saveStep1(id, { name: orgName, industry });

      if (logoFile) {
        const fd = new FormData();
        fd.append("logo", logoFile);
        const res = await fetch("/api/upload-logo", {
          method: "POST",
          body: fd,
        });
        const body = (await res.json()) as { url?: string; error?: string };
        if (!res.ok) {
          setError(
            body.error ??
              "Logo upload failed. Your details were saved — you can continue without a logo.",
          );
        } else {
          setLogoUrl(body.url ?? null);
        }
      }

      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleStep2Next() {
    setLoading(true);
    setError(null);

    try {
      const id = await resolveOrgId();
      if (!id) return;

      await saveContext(id, { vendors, terminology, events, orgStructure });
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleFinish() {
    setLoading(true);
    setError(null);

    try {
      const id = await resolveOrgId();
      if (!id) return;

      await markOnboardingComplete(id);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-4 py-12"
      style={{ backgroundColor: "var(--ds-surface)" }}
    >
      {/* Wordmark */}
      <div className="mb-10 flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-[8px] flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: "var(--ds-primary)" }}
        >
          P
        </div>
        <span
          className="text-[15px] font-semibold tracking-tight"
          style={{ color: "var(--ds-ink)" }}
        >
          PhishSim
        </span>
      </div>

      <div className="w-full max-w-[520px]">
        <h1
          className="text-center text-[22px] font-[600] leading-[1.30] mb-2"
          style={{ color: "var(--ds-ink)" }}
        >
          Set up your workspace
        </h1>
        <p
          className="text-center text-[14px] leading-[1.50] mb-8"
          style={{ color: "var(--ds-steel)" }}
        >
          This takes about 2 minutes. You can update everything later.
        </p>

        <StepIndicator current={step} />
        <StepLabel step={step} />

        {/* ── Step 1: Company details ── */}
        {step === 1 && (
          <div
            className="rounded-[12px] border p-8 flex flex-col gap-5"
            style={{
              backgroundColor: "var(--ds-canvas)",
              borderColor: "var(--ds-hairline)",
            }}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-name">Company name</Label>
              <Input
                id="org-name"
                type="text"
                placeholder="Acme Corp"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="industry">Industry</Label>
              <Select
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                <option value="" disabled>
                  Select your industry
                </option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Company logo</Label>
              <div
                className="rounded-[8px] border border-dashed p-4 flex flex-col items-center gap-3 cursor-pointer transition-colors"
                style={{ borderColor: "var(--ds-hairline-strong)" }}
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview || logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoPreview ?? logoUrl ?? ""}
                    alt="Logo preview"
                    className="h-16 w-auto object-contain rounded-[4px]"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-[8px] flex items-center justify-center"
                    style={{ backgroundColor: "var(--ds-surface)" }}
                  >
                    <Upload size={20} style={{ color: "var(--ds-stone)" }} />
                  </div>
                )}
                <div className="text-center">
                  <p
                    className="text-[14px] font-[500]"
                    style={{ color: "var(--ds-ink)" }}
                  >
                    {logoFile
                      ? logoFile.name
                      : logoUrl
                        ? "Replace logo"
                        : "Upload logo"}
                  </p>
                  <p
                    className="text-[13px] mt-0.5"
                    style={{ color: "var(--ds-stone)" }}
                  >
                    PNG, JPG or SVG — max 2 MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
              <p
                className="text-[12px]"
                style={{ color: "var(--ds-stone)" }}
              >
                Requires a &quot;logos&quot; bucket in Supabase Storage set to
                public.
              </p>
            </div>

            {error && (
              <p
                className="text-[13px] leading-[1.40]"
                style={{ color: "var(--ds-error)" }}
              >
                {error}
              </p>
            )}

            <Button
              type="button"
              onClick={() => void handleStep1Next()}
              disabled={loading || orgLoading || !orgName}
              className="w-full h-11 rounded-[8px] text-[14px] font-[500]"
              style={{
                backgroundColor:
                  loading || orgLoading || !orgName
                    ? "var(--ds-hairline)"
                    : "var(--ds-primary)",
                color:
                  loading || orgLoading || !orgName
                    ? "var(--ds-muted)"
                    : "#ffffff",
              }}
            >
              {orgLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading workspace…
                </>
              ) : loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        )}

        {/* ── Step 2: Company context ── */}
        {step === 2 && (
          <div
            className="rounded-[12px] border p-8 flex flex-col gap-5"
            style={{
              backgroundColor: "var(--ds-canvas)",
              borderColor: "var(--ds-hairline)",
            }}
          >
            <p
              className="text-[14px] leading-[1.50] -mt-1"
              style={{ color: "var(--ds-steel)" }}
            >
              Help PhishSim craft realistic, context-aware simulations for your
              team. All fields are optional.
            </p>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vendors">Main vendors & tools used</Label>
              <Textarea
                id="vendors"
                placeholder="e.g. Slack, Salesforce, AWS, Okta, Jira…"
                rows={3}
                value={vendors}
                onChange={(e) => setVendors(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="terminology">Internal terminology</Label>
              <Textarea
                id="terminology"
                placeholder="e.g. 'Ops team' = Operations dept, 'the Hub' = internal intranet…"
                rows={3}
                value={terminology}
                onChange={(e) => setTerminology(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="events">Recent company events</Label>
              <Textarea
                id="events"
                placeholder="e.g. recent all-hands, product launch, office move, acquisitions…"
                rows={3}
                value={events}
                onChange={(e) => setEvents(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-structure">Org structure notes</Label>
              <Textarea
                id="org-structure"
                placeholder="e.g. ~500 employees, 6 departments: Engineering, Sales, HR, Finance, Legal, Marketing…"
                rows={3}
                value={orgStructure}
                onChange={(e) => setOrgStructure(e.target.value)}
              />
            </div>

            {error && (
              <p
                className="text-[13px] leading-[1.40]"
                style={{ color: "var(--ds-error)" }}
              >
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-11 px-4 rounded-[8px] text-[14px] font-[500] border transition-colors"
                style={{
                  borderColor: "var(--ds-hairline-strong)",
                  color: "var(--ds-ink)",
                  backgroundColor: "transparent",
                }}
              >
                Back
              </button>
              <Button
                onClick={handleStep2Next}
                disabled={loading}
                className="flex-1 h-11 rounded-[8px] text-[14px] font-[500]"
                style={{
                  backgroundColor: loading
                    ? "var(--ds-hairline)"
                    : "var(--ds-primary)",
                  color: loading ? "var(--ds-muted)" : "#ffffff",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Confirmation ── */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div
              className="rounded-[12px] border p-8"
              style={{
                backgroundColor: "var(--ds-tint-lavender)",
                borderColor: "var(--ds-hairline)",
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--ds-primary)" }}
                >
                  <CheckCircle2 size={18} color="#fff" />
                </div>
                <div>
                  <p
                    className="text-[15px] font-[600]"
                    style={{ color: "var(--ds-ink)" }}
                  >
                    You&apos;re all set!
                  </p>
                  <p
                    className="text-[13px]"
                    style={{ color: "var(--ds-slate)" }}
                  >
                    Here&apos;s a summary of your setup.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <SummarySection title="Company details">
                  <SummaryRow label="Name" value={orgName || "—"} />
                  <SummaryRow label="Industry" value={industry || "—"} />
                  <SummaryRow
                    label="Logo"
                    value={
                      logoUrl || logoPreview
                        ? "Uploaded"
                        : "Not uploaded"
                    }
                  />
                </SummarySection>

                <Separator />

                <SummarySection title="Company context">
                  <SummaryRow
                    label="Vendors & tools"
                    value={vendors || "—"}
                    multiline
                  />
                  <SummaryRow
                    label="Terminology"
                    value={terminology || "—"}
                    multiline
                  />
                  <SummaryRow
                    label="Recent events"
                    value={events || "—"}
                    multiline
                  />
                  <SummaryRow
                    label="Org structure"
                    value={orgStructure || "—"}
                    multiline
                  />
                </SummarySection>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="h-11 px-4 rounded-[8px] text-[14px] font-[500] border transition-colors"
                style={{
                  borderColor: "var(--ds-hairline-strong)",
                  color: "var(--ds-ink)",
                  backgroundColor: "transparent",
                }}
              >
                Back
              </button>
              <Button
                onClick={() => void handleFinish()}
                disabled={loading}
                className="flex-1 h-11 rounded-[8px] text-[14px] font-[500]"
                style={{
                  backgroundColor: loading
                    ? "var(--ds-hairline)"
                    : "var(--ds-primary)",
                  color: loading ? "var(--ds-muted)" : "#ffffff",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finishing setup…
                  </>
                ) : (
                  "Go to Dashboard"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummarySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        className="text-[11px] font-[600] uppercase tracking-[1px] mb-3"
        style={{ color: "var(--ds-stone)" }}
      >
        {title}
      </p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div
      className={`flex ${multiline ? "flex-col gap-0.5" : "items-baseline justify-between gap-4"}`}
    >
      <span
        className="text-[13px] font-[500] shrink-0"
        style={{ color: "var(--ds-charcoal)" }}
      >
        {label}
      </span>
      <span
        className="text-[13px] leading-[1.50]"
        style={{
          color:
            value === "—" || value === "Not uploaded"
              ? "var(--ds-stone)"
              : "var(--ds-slate)",
          wordBreak: multiline ? "break-word" : undefined,
        }}
      >
        {value}
      </span>
    </div>
  );
}
