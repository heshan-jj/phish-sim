"use client";

import type { SimulationVariantProps } from "@/components/simulations/types";
import {
  SimulationInput,
  SubmitButton,
} from "@/components/simulations/shared/form-fields";
import { useDocumentTitle } from "@/components/simulations/shared/use-document-title";
import { useLoginSteps } from "@/components/simulations/shared/use-login-steps";
import { MfaLogo } from "@/components/simulations/logos";
import { VARIANT_META } from "@/components/simulations/variant-meta";
import { type FormEvent, useState } from "react";

const STEPS = ["credentials", "otp"] as const;

export function MfaVariant({ onSubmit, submitting }: SimulationVariantProps) {
  const meta = VARIANT_META.mfa;
  useDocumentTitle(meta.documentTitle);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const { currentStep, isLast, next } = useLoginSteps(STEPS);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLast) {
      next();
      return;
    }
    await onSubmit({ email, password });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f8fafc] px-4">
      <div className="w-full max-w-[420px] rounded-lg border border-[#e2e8f0] bg-white p-8 shadow-md">
        <MfaLogo />
        <h1 className="mt-4 text-xl font-semibold text-[#111827]">Secure your account</h1>
        <p className="mt-1 text-sm text-[#64748b]">
          {currentStep === "credentials"
            ? "Sign in to complete MFA setup"
            : "Enter the code from Microsoft Authenticator"}
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {currentStep === "credentials" ? (
            <>
              <SimulationInput
                id="mfa-email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Work email"
                autoComplete="username"
                required
              />
              <SimulationInput
                id="mfa-password"
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="Password"
                autoComplete="current-password"
                required
              />
            </>
          ) : (
            <>
              <div className="rounded-lg border border-[#bfdbfe] bg-[#eff6ff] p-4 text-sm text-[#1e40af]">
                Approve sign-in request on your phone, or enter the 6-digit code below.
              </div>
              <SimulationInput
                id="mfa-otp"
                label="Verification code"
                value={otp}
                onChange={setOtp}
                placeholder="000000"
                required
                className="text-center text-lg tracking-[0.3em]"
              />
            </>
          )}
          <SubmitButton disabled={submitting} className={meta.buttonClass}>
            {submitting ? "..." : currentStep === "credentials" ? "Continue" : "Verify"}
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
