"use client";

import type { SimulationVariantProps } from "@/components/simulations/types";
import {
  InactiveLink,
  SimulationInput,
  SubmitButton,
} from "@/components/simulations/shared/form-fields";
import { useDocumentTitle } from "@/components/simulations/shared/use-document-title";
import { useLoginSteps } from "@/components/simulations/shared/use-login-steps";
import { GoogleLogo } from "@/components/simulations/logos";
import { VARIANT_META } from "@/components/simulations/variant-meta";
import { type FormEvent, useState } from "react";

const STEPS = ["identifier", "password"] as const;

export function GoogleWorkspaceVariant({
  onSubmit,
  submitting,
}: SimulationVariantProps) {
  const meta = VARIANT_META.google_workspace;
  useDocumentTitle(meta.documentTitle);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { currentStep, isLast, next, back, canGoBack } = useLoginSteps(STEPS);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLast) {
      next();
      return;
    }
    await onSubmit({ email, password });
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#f0f4f9] px-4 py-8 font-[Roboto,Arial,sans-serif]">
      <div className="w-full max-w-[448px] rounded-lg border border-[#dadce0] bg-white px-10 py-12 shadow-sm">
        
          <div className="mb-6 flex justify-center">
            <GoogleLogo className="h-10 w-10" />
          </div>

          <h1 className="text-center text-2xl font-normal text-[#202124]">Sign in</h1>
          <p className="mt-1 text-center text-base text-[#202124]">
            {currentStep === "identifier" ? (
              "Use your Google Account"
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-[#1a73e8] text-xs text-white">
                  {email.charAt(0).toUpperCase() || "?"}
                </span>
                {email || "your account"}
              </span>
            )}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {currentStep === "identifier" ? (
              <SimulationInput
                id="google-email"
                label="Email or phone"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Email or phone"
                autoComplete="username"
                required
                className="rounded-sm border-[#dadce0] focus:border-[#1a73e8] focus:shadow-[0_0_0_1px_#1a73e8]"
              />
            ) : (
              <>
                {canGoBack ? (
                  <button
                    type="button"
                    onClick={back}
                    className="text-sm text-[#1a73e8] hover:underline"
                  >
                    Change account
                  </button>
                ) : null}
                <SimulationInput
                  id="google-password"
                  label="Enter your password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="rounded-sm border-[#dadce0] focus:border-[#1a73e8] focus:shadow-[0_0_0_1px_#1a73e8]"
                />
              </>
            )}

            <div className="flex items-center justify-between gap-4">
              {currentStep === "password" ? (
                <InactiveLink className="text-[#1a73e8]">Forgot password?</InactiveLink>
              ) : (
                <span />
              )}
              <SubmitButton
                disabled={submitting}
                className={`ml-auto w-auto min-w-[88px] rounded-full px-6 ${meta.buttonClass}`}
              >
                {submitting ? "..." : "Next"}
              </SubmitButton>
            </div>
          </form>

          {currentStep === "identifier" ? (
            <div className="mt-8 flex flex-wrap justify-center gap-4 border-t border-[#dadce0] pt-6">
              <InactiveLink className="text-[#1a73e8]">Create account</InactiveLink>
              <InactiveLink className="text-[#1a73e8]">Forgot email?</InactiveLink>
            </div>
          ) : null}
        </div>

        <p className="mt-6 text-xs text-[#5f6368]">
        <InactiveLink className="text-[#5f6368]">Help</InactiveLink>
        {" · "}
        <InactiveLink className="text-[#5f6368]">Privacy</InactiveLink>
        {" · "}
        <InactiveLink className="text-[#5f6368]">Terms</InactiveLink>
        </p>
    </div>
  );
}


