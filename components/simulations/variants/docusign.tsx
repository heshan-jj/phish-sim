"use client";

import type { SimulationVariantProps } from "@/components/simulations/types";
import {
  InactiveLink,
  SimulationInput,
  SubmitButton,
} from "@/components/simulations/shared/form-fields";
import { useCredentialForm } from "@/components/simulations/shared/use-credential-form";
import { useDocumentTitle } from "@/components/simulations/shared/use-document-title";
import { DocusignLogo } from "@/components/simulations/logos";
import { VARIANT_META } from "@/components/simulations/variant-meta";

export function DocusignVariant({
  onSubmit,
  submitting,
  senderName,
}: SimulationVariantProps) {
  const meta = VARIANT_META.docusign;
  useDocumentTitle(meta.documentTitle);
  const { email, setEmail, password, setPassword, handleFormSubmit } =
    useCredentialForm(onSubmit);

  return (
    <div className="min-h-dvh bg-[#f7f8fc]">
      <div className="bg-[#4a00e0] px-6 py-4">
        <DocusignLogo className="h-6 w-[120px] [&_text]:fill-white" />
      </div>
      <div className="mx-auto max-w-md px-4 py-8">
        
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#4a00e0]">
              Action required
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[#111827]">
              Document awaiting your signature
            </h2>
            <p className="mt-2 text-sm text-[#6b7280]">
              From <span className="font-medium text-[#111827]">{senderName}</span>
            </p>
            <p className="mt-3 text-sm text-[#374151]">
              Please review and sign the confidential agreement before the deadline expires.
            </p>
          </div>

          <div className="mt-6 rounded-lg border border-[#e5e7eb] bg-white p-8 shadow-sm">
            <h1 className="text-xl font-semibold text-[#111827]">Sign in</h1>
            <p className="mt-1 text-sm text-[#6b7280]">to continue to DocuSign</p>
            <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
              <SimulationInput
                id="ds-email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Email address"
                autoComplete="username"
                required
              />
              <SimulationInput
                id="ds-password"
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="Password"
                autoComplete="current-password"
                required
              />
              <SubmitButton
                disabled={submitting}
                className={`uppercase tracking-wide ${meta.buttonClass}`}
              >
                {submitting ? "..." : "Log in"}
              </SubmitButton>
            </form>
            <InactiveLink className={`mt-4 block text-sm ${meta.accentClass}`}>
              Can&apos;t access your account?
            </InactiveLink>
          </div>
      </div>
    </div>
  );
}
