"use client";

import type { SimulationVariantProps } from "@/components/simulations/types";
import {
  InactiveLink,
  SimulationInput,
  SubmitButton,
} from "@/components/simulations/shared/form-fields";
import { useCredentialForm } from "@/components/simulations/shared/use-credential-form";
import { useDocumentTitle } from "@/components/simulations/shared/use-document-title";
import { DropboxLogo } from "@/components/simulations/logos";
import { VARIANT_META } from "@/components/simulations/variant-meta";

export function DropboxVariant({ onSubmit, submitting }: SimulationVariantProps) {
  const meta = VARIANT_META.dropbox;
  useDocumentTitle(meta.documentTitle);
  const { email, setEmail, password, setPassword, handleFormSubmit } =
    useCredentialForm(onSubmit);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f7faff] px-4">
      <div className="w-full max-w-[400px]">
        <DropboxLogo className="mb-6" />
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-[#1e1919]">Sign in to Dropbox Business</h1>
          <p className="mt-1 text-sm text-[#637282]">to review your storage</p>
          <button
            type="button"
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded border border-[#ddd] bg-white text-sm font-medium text-[#1e1919] opacity-60"
            disabled
          >
            Sign in with Google
          </button>
          <div className="my-4 flex items-center gap-3 text-xs text-[#637282]">
            <span className="h-px flex-1 bg-[#ddd]" />
            or
            <span className="h-px flex-1 bg-[#ddd]" />
          </div>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <SimulationInput
              id="db-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Email"
              autoComplete="username"
              required
            />
            <SimulationInput
              id="db-password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Password"
              autoComplete="current-password"
              required
            />
            <SubmitButton disabled={submitting} className={meta.buttonClass}>
              {submitting ? "..." : "Sign in"}
            </SubmitButton>
          </form>
          <InactiveLink className={`mt-4 text-sm ${meta.accentClass}`}>Forgot password?</InactiveLink>
        </div>
      </div>
    </div>
  );
}
