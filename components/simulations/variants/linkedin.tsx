"use client";

import type { SimulationVariantProps } from "@/components/simulations/types";
import {
  InactiveLink,
  SimulationInput,
  SubmitButton,
} from "@/components/simulations/shared/form-fields";
import { useCredentialForm } from "@/components/simulations/shared/use-credential-form";
import { useDocumentTitle } from "@/components/simulations/shared/use-document-title";
import { LinkedInLogo } from "@/components/simulations/logos";
import { VARIANT_META } from "@/components/simulations/variant-meta";

export function LinkedinVariant({ onSubmit, submitting }: SimulationVariantProps) {
  const meta = VARIANT_META.linkedin;
  useDocumentTitle(meta.documentTitle);
  const { email, setEmail, password, setPassword, handleFormSubmit } =
    useCredentialForm(onSubmit);

  return (
    <div className="min-h-dvh bg-[#f3f2ef]">
      <div className="bg-[#0a66c2] px-6 py-3">
        <LinkedInLogo className="h-8 w-8" />
      </div>
      <div className="mx-auto mt-12 max-w-[400px] px-4">
        <div className="rounded-lg border border-[#e0e0e0] bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-[#191919]">Sign in</h1>
          <p className="mt-1 text-sm text-[#666]">Stay updated on your professional world</p>
          <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
            <SimulationInput
              id="li-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Email"
              autoComplete="username"
              required
              className="rounded-sm"
            />
            <SimulationInput
              id="li-password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Password"
              autoComplete="current-password"
              required
              className="rounded-sm"
            />
            <SubmitButton disabled={submitting} className={`rounded-full ${meta.buttonClass}`}>
              {submitting ? "..." : "Sign in"}
            </SubmitButton>
          </form>
          <InactiveLink className={`mt-4 text-sm ${meta.accentClass}`}>Forgot password?</InactiveLink>
        </div>
      </div>
    </div>
  );
}
