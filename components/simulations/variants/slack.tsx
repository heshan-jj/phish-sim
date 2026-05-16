"use client";

import type { SimulationVariantProps } from "@/components/simulations/types";
import {
  InactiveLink,
  SimulationInput,
  SubmitButton,
} from "@/components/simulations/shared/form-fields";
import { useDocumentTitle } from "@/components/simulations/shared/use-document-title";
import { useLoginSteps } from "@/components/simulations/shared/use-login-steps";
import { SlackLogo } from "@/components/simulations/logos";
import { VARIANT_META } from "@/components/simulations/variant-meta";
import { type FormEvent, useState } from "react";

const STEPS = ["workspace", "credentials"] as const;

export function SlackVariant({ onSubmit, submitting }: SimulationVariantProps) {
  const meta = VARIANT_META.slack;
  useDocumentTitle(meta.documentTitle);
  const [workspace, setWorkspace] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="flex min-h-dvh items-center justify-center bg-[#f8f8f8] px-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex justify-center">
          <SlackLogo className="h-12 w-12" />
        </div>
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <h1 className="text-center text-2xl font-bold text-[#1d1c1d]">Sign in to Slack</h1>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {currentStep === "workspace" ? (
              <>
                <SimulationInput
                  id="slack-workspace"
                  label="Workspace URL"
                  value={workspace}
                  onChange={setWorkspace}
                  placeholder="yourteam"
                  required
                />
                <p className="text-sm text-[#616061]">
                  .slack.com — <span className="font-medium">{workspace || "yourteam"}</span>
                  .slack.com
                </p>
              </>
            ) : (
              <>
                <SimulationInput
                  id="slack-email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="name@company.com"
                  autoComplete="username"
                  required
                />
                <SimulationInput
                  id="slack-password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                />
              </>
            )}
            <SubmitButton disabled={submitting} className={meta.buttonClass}>
              {submitting ? "..." : currentStep === "workspace" ? "Continue" : "Sign In With Email"}
            </SubmitButton>
          </form>
          <InactiveLink className={`mt-4 block text-center text-sm ${meta.accentClass}`}>
            Forgot your password?
          </InactiveLink>
        </div>
      </div>
    </div>
  );
}
