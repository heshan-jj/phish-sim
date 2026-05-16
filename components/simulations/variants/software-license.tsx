"use client";

import type { SimulationVariantProps } from "@/components/simulations/types";
import {
  SimulationInput,
  SubmitButton,
} from "@/components/simulations/shared/form-fields";
import { useCredentialForm } from "@/components/simulations/shared/use-credential-form";
import { useDocumentTitle } from "@/components/simulations/shared/use-document-title";
import { SoftwareLicenseLogo } from "@/components/simulations/logos";
import { VARIANT_META } from "@/components/simulations/variant-meta";

export function SoftwareLicenseVariant({ onSubmit, submitting }: SimulationVariantProps) {
  const meta = VARIANT_META.software_license;
  useDocumentTitle(meta.documentTitle);
  const { email, setEmail, password, setPassword, handleFormSubmit } =
    useCredentialForm(onSubmit);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f8fafc] px-4">
      <div className="w-full max-w-md">
        <div className="mb-4 rounded-lg border border-[#fbbf24] bg-[#fffbeb] p-4 text-sm text-[#92400e]">
          <strong>License expires in 3 days.</strong> Sign in to renew Creative Cloud and
          Microsoft 365 access before services are suspended.
        </div>
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-8 shadow-md">
          <SoftwareLicenseLogo />
          <h1 className="mt-4 text-xl font-semibold text-[#111827]">Software License Portal</h1>
          <p className="mt-1 text-sm text-[#6b7280]">Sign in to renew access</p>
          <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
            <SimulationInput
              id="sw-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Work email"
              autoComplete="username"
              required
            />
            <SimulationInput
              id="sw-password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Password"
              autoComplete="current-password"
              required
            />
            <SubmitButton disabled={submitting} className={meta.buttonClass}>
              {submitting ? "..." : "Renew License"}
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
