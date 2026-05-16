"use client";

import type { SimulationVariantProps } from "@/components/simulations/types";
import {
  SimulationInput,
  SubmitButton,
} from "@/components/simulations/shared/form-fields";
import { useCredentialForm } from "@/components/simulations/shared/use-credential-form";
import { useDocumentTitle } from "@/components/simulations/shared/use-document-title";
import { ShippingLogo } from "@/components/simulations/logos";
import { VARIANT_META } from "@/components/simulations/variant-meta";

export function ShippingVariant({ onSubmit, submitting }: SimulationVariantProps) {
  const meta = VARIANT_META.shipping;
  useDocumentTitle(meta.documentTitle);
  const { email, setEmail, password, setPassword, handleFormSubmit } =
    useCredentialForm(onSubmit);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#faf7ff] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-[#ddd6fe] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <ShippingLogo />
            <div>
              <p className="text-xs text-[#6b7280]">Tracking number</p>
              <p className="font-mono text-sm font-semibold text-[#111827]">1Z999AA10123456784</p>
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-[#7c3aed]">Delivery attempt failed</p>
          <p className="mt-1 text-sm text-[#6b7280]">
            Verify your address and reschedule delivery within 48 hours.
          </p>
        </div>
        
          <div className="mt-4 rounded-lg bg-white p-6 shadow-md">
            <h1 className="text-lg font-semibold text-[#111827]">Delivery Verification</h1>
            <p className="mt-1 text-sm text-[#6b7280]">Sign in to confirm your details</p>
            <form onSubmit={handleFormSubmit} className="mt-4 space-y-3">
              <SimulationInput
                id="sh-email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Email"
                autoComplete="username"
                required
              />
              <SimulationInput
                id="sh-password"
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
          </div>
      </div>
    </div>
  );
}
