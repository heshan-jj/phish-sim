"use client";

import type { SimulationVariantProps } from "@/components/simulations/types";
import {
  InactiveLink,
  SimulationInput,
  SubmitButton,
} from "@/components/simulations/shared/form-fields";
import { useCredentialForm } from "@/components/simulations/shared/use-credential-form";
import { useDocumentTitle } from "@/components/simulations/shared/use-document-title";
import { SsoShieldLogo } from "@/components/simulations/logos";
import { VARIANT_META } from "@/components/simulations/variant-meta";

export function GenericSsoVariant({
  onSubmit,
  submitting,
  companyName,
}: SimulationVariantProps) {
  const meta = VARIANT_META.generic_sso;
  useDocumentTitle(meta.documentTitle);
  const org = companyName?.trim() || "Your organization";
  const { email, setEmail, password, setPassword, handleFormSubmit } =
    useCredentialForm(onSubmit);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f5f7fb] px-4">
          <div className="w-full max-w-[420px] rounded-xl border border-[#e2e8f0] bg-white p-8 shadow-lg">
            <SsoShieldLogo />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#64748b]">
              {org}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-[#0f172a]">Single sign-on</h1>
            <p className="mt-1 text-sm text-[#64748b]">Use your organization account</p>
            <button
              type="button"
              className={`mt-6 h-11 w-full rounded-lg text-sm font-semibold text-white ${meta.buttonClass}`}
            >
              Sign in with SSO
            </button>
            <div className="my-6 flex items-center gap-3 text-xs text-[#94a3b8]">
              <span className="h-px flex-1 bg-[#e2e8f0]" />
              or continue with email
              <span className="h-px flex-1 bg-[#e2e8f0]" />
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <SimulationInput
                id="sso-email"
                label="Work email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Work email"
                autoComplete="username"
                required
              />
              <SimulationInput
                id="sso-password"
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="Password"
                autoComplete="current-password"
                required
              />
              <SubmitButton disabled={submitting} className={meta.buttonClass}>
                {submitting ? "..." : "Continue"}
              </SubmitButton>
            </form>
            <InactiveLink className={`mt-4 text-sm ${meta.accentClass}`}>
              Need help signing in?
            </InactiveLink>
          </div>
    </div>
  );
}
