"use client";

import type { SimulationVariantProps } from "@/components/simulations/types";
import {
  InactiveLink,
  SimulationInput,
  SubmitButton,
} from "@/components/simulations/shared/form-fields";
import { useCredentialForm } from "@/components/simulations/shared/use-credential-form";
import { useDocumentTitle } from "@/components/simulations/shared/use-document-title";
import { WorkdayLogo } from "@/components/simulations/logos";
import { VARIANT_META } from "@/components/simulations/variant-meta";
import { type FormEvent, useState } from "react";

export function WorkdayVariant({ onSubmit, submitting }: SimulationVariantProps) {
  const meta = VARIANT_META.workday;
  useDocumentTitle(meta.documentTitle);
  const [tenant, setTenant] = useState("");
  const { email, setEmail, password, setPassword } = useCredentialForm(onSubmit);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({ email, password });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#eef3f7] px-4 py-8">
      <div className="w-full max-w-[420px] rounded-md bg-white p-8 shadow-lg">
        <WorkdayLogo />
        <h1 className="mt-6 text-2xl font-semibold text-[#1f3b63]">Sign In to Workday</h1>
        <p className="mt-1 text-sm text-[#5a6b7d]">Use your organization account</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <SimulationInput
            id="wd-tenant"
            label="Company name for Workday URL"
            value={tenant}
            onChange={setTenant}
            placeholder="company"
            required
            className="rounded-sm"
          />
          <p className="-mt-2 text-xs text-[#5a6b7d]">
            https://<span className="font-medium">{tenant || "company"}</span>.workday.com
          </p>
          <SimulationInput
            id="wd-email"
            label="Username"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="Username"
            autoComplete="username"
            required
          />
          <SimulationInput
            id="wd-password"
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
        <InactiveLink className={`mt-4 text-sm ${meta.accentClass}`}>
          Need help signing in?
        </InactiveLink>
      </div>
    </div>
  );
}
