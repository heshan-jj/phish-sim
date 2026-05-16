"use client";

import type { SimulationVariantProps } from "@/components/simulations/types";
import {
  InactiveLink,
  SimulationInput,
  SubmitButton,
} from "@/components/simulations/shared/form-fields";
import { useCredentialForm } from "@/components/simulations/shared/use-credential-form";
import { useDocumentTitle } from "@/components/simulations/shared/use-document-title";
import { MicrosoftLogo } from "@/components/simulations/logos";
import { VARIANT_META } from "@/components/simulations/variant-meta";

export function Microsoft365Variant({ onSubmit, submitting }: SimulationVariantProps) {
  const meta = VARIANT_META.microsoft365;
  useDocumentTitle(meta.documentTitle);
  const { email, setEmail, password, setPassword, handleFormSubmit } =
    useCredentialForm(onSubmit);

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <div className="hidden flex-1 flex-col justify-end bg-[#f2f2f2] p-10 md:flex">
        <MicrosoftLogo className="h-6 w-6" />
        <p className="mt-6 text-2xl font-semibold text-[#1b1b1b]">Microsoft 365</p>
        <p className="mt-2 max-w-sm text-sm text-[#605e5c]">
          One account for Outlook, Teams, Word, Excel, and more.
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-center bg-white px-6 py-10 md:px-12">
        <div className="mx-auto w-full max-w-[440px]">
          <div className="mb-6 flex items-center gap-2 md:hidden">
            <MicrosoftLogo />
            <span className="text-sm font-semibold text-[#1b1b1b]">Microsoft</span>
          </div>

          <h1 className="text-2xl font-semibold text-[#1b1b1b]">Sign in</h1>
          <InactiveLink className="mt-1 block text-sm text-[#0067b8]">
            No account? Create one!
          </InactiveLink>

          <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
            <SimulationInput
              id="ms-email"
              label="Email, phone, or Skype"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Email, phone, or Skype"
              autoComplete="username"
              required
              className="border-[#8a8886] focus:border-[#0067b8] focus:shadow-[0_0_0_1px_#0067b8]"
            />
            <SimulationInput
              id="ms-password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Password"
              autoComplete="current-password"
              required
              className="border-[#8a8886] focus:border-[#0067b8] focus:shadow-[0_0_0_1px_#0067b8]"
            />
            <InactiveLink className="text-sm text-[#0067b8]">Forgot my password</InactiveLink>
            <SubmitButton disabled={submitting} className={meta.buttonClass}>
              {submitting ? "Signing in..." : "Sign in"}
            </SubmitButton>
          </form>

          <div className="mt-8 flex flex-wrap gap-3 text-xs text-[#605e5c]">
            <InactiveLink>Terms of use</InactiveLink>
            <InactiveLink>Privacy & cookies</InactiveLink>
            <InactiveLink>...</InactiveLink>
          </div>
        </div>
      </div>
    </div>
  );
}

