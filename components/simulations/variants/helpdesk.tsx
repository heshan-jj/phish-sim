"use client";

import type { SimulationVariantProps } from "@/components/simulations/types";
import {
  SimulationInput,
  SubmitButton,
} from "@/components/simulations/shared/form-fields";
import { useCredentialForm } from "@/components/simulations/shared/use-credential-form";
import { useDocumentTitle } from "@/components/simulations/shared/use-document-title";
import { HelpdeskLogo } from "@/components/simulations/logos";
import { VARIANT_META } from "@/components/simulations/variant-meta";

export function HelpdeskVariant({ onSubmit, submitting }: SimulationVariantProps) {
  const meta = VARIANT_META.helpdesk;
  useDocumentTitle(meta.documentTitle);
  const { email, setEmail, password, setPassword, handleFormSubmit } =
    useCredentialForm(onSubmit);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f4f7fb] px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="mb-6 rounded-lg border border-[#cbd5e1] bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <HelpdeskLogo />
            <div>
              <p className="text-xs font-semibold text-[#64748b]">INC0048217</p>
              <h2 className="mt-1 font-semibold text-[#0f172a]">
                Password reset request pending approval
              </h2>
              <p className="mt-2 text-sm text-[#475569]">
                Priority: High · Assigned to IT Service Desk · Updated 2 hours ago
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="text-xl font-semibold text-[#0f172a]">Helpdesk Portal</h1>
          <p className="mt-1 text-sm text-[#64748b]">Sign in to review your ticket</p>
          <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
            <SimulationInput
              id="hd-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Work email"
              autoComplete="username"
              required
            />
            <SimulationInput
              id="hd-password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Password"
              autoComplete="current-password"
              required
            />
            <SubmitButton disabled={submitting} className={meta.buttonClass}>
              {submitting ? "..." : "Review Ticket"}
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
