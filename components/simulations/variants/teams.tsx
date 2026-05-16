"use client";

import type { SimulationVariantProps } from "@/components/simulations/types";
import {
  InactiveLink,
  SimulationInput,
  SubmitButton,
} from "@/components/simulations/shared/form-fields";
import { useCredentialForm } from "@/components/simulations/shared/use-credential-form";
import { useDocumentTitle } from "@/components/simulations/shared/use-document-title";
import { TeamsLogo } from "@/components/simulations/logos";
import { VARIANT_META } from "@/components/simulations/variant-meta";

export function TeamsVariant({ onSubmit, submitting }: SimulationVariantProps) {
  const meta = VARIANT_META.teams;
  useDocumentTitle(meta.documentTitle);
  const { email, setEmail, password, setPassword, handleFormSubmit } =
    useCredentialForm(onSubmit);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#f5f5fb] px-4">
        <div className="w-full max-w-[400px] rounded-lg bg-white p-8 shadow-md">
          <TeamsLogo className="mx-auto" />
          <h1 className="mt-6 text-center text-2xl font-semibold text-[#252423]">
            Welcome to Teams
          </h1>
          <p className="mt-1 text-center text-sm text-[#605e5c]">
            Sign in to view your unread messages
          </p>
          <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
            <SimulationInput
              id="teams-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="name@company.com"
              autoComplete="username"
              required
            />
            <SimulationInput
              id="teams-password"
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
          <InactiveLink className={`mt-4 block text-center text-sm ${meta.accentClass}`}>
            Use another account
          </InactiveLink>
        </div>
    </div>
  );
}
