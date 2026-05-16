"use client";

import type { SimulationVariantProps } from "@/components/simulations/types";
import {
  SimulationInput,
  SubmitButton,
} from "@/components/simulations/shared/form-fields";
import { useCredentialForm } from "@/components/simulations/shared/use-credential-form";
import { useDocumentTitle } from "@/components/simulations/shared/use-document-title";
import { BenefitsLogo } from "@/components/simulations/logos";
import { VARIANT_META } from "@/components/simulations/variant-meta";

export function BenefitsVariant({ onSubmit, submitting }: SimulationVariantProps) {
  const meta = VARIANT_META.benefits;
  useDocumentTitle(meta.documentTitle);
  const { email, setEmail, password, setPassword, handleFormSubmit } =
    useCredentialForm(onSubmit);

  return (
    <div className="min-h-dvh bg-[#f0fdfa]">
      <div className="bg-[#0f766e] px-6 py-3 text-center text-sm font-medium text-white">
        Open enrollment ends Friday — review your 2026 benefit plans
      </div>
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-10">
        <BenefitsLogo />
        <div className="mt-6 w-full rounded-lg bg-white p-8 shadow-md">
          <h1 className="text-xl font-semibold text-[#134e4a]">Benefits Sign In</h1>
          <p className="mt-1 text-sm text-[#64748b]">Review your enrollment elections</p>
          <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
            <SimulationInput
              id="bn-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Work email"
              autoComplete="username"
              required
            />
            <SimulationInput
              id="bn-password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Password"
              autoComplete="current-password"
              required
            />
            <SubmitButton disabled={submitting} className={meta.buttonClass}>
              {submitting ? "..." : "Sign In"}
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
