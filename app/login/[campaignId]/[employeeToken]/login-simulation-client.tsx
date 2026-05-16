"use client";

import { SIMULATION_VARIANTS } from "@/components/simulations/registry";
import { SimulationDebriefDialog } from "@/components/simulations/shared/simulation-debrief-dialog";
import { useSimulationTracking } from "@/components/simulations/shared/use-simulation-tracking";
import { VARIANT_META } from "@/components/simulations/variant-meta";
import type { LandingPageType } from "@/lib/campaign-templates";

interface LoginSimulationClientProps {
  token: string;
  campaignId: string;
  variant: LandingPageType;
  senderName: string;
  senderEmail: string;
  subject: string;
  redFlags: string[];
  clickRate: number;
  companyName?: string;
}

export function LoginSimulationClient({
  token,
  campaignId,
  variant,
  senderName,
  senderEmail,
  subject,
  redFlags,
  clickRate,
  companyName,
}: LoginSimulationClientProps) {
  const { submitting, showDebrief, setShowDebrief, submitCredentials } =
    useSimulationTracking({ token, campaignId, variant });

  const VariantComponent = SIMULATION_VARIANTS[variant];
  const meta = VARIANT_META[variant];

  return (
    <>
      <VariantComponent
        token={token}
        campaignId={campaignId}
        variant={variant}
        senderName={senderName}
        senderEmail={senderEmail}
        subject={subject}
        redFlags={redFlags}
        clickRate={clickRate}
        companyName={companyName}
        onSubmit={({ email, password }) => submitCredentials(email, password)}
        submitting={submitting}
      />
      <SimulationDebriefDialog
        open={showDebrief}
        onOpenChange={setShowDebrief}
        senderName={senderName}
        senderEmail={senderEmail}
        subject={subject}
        redFlags={redFlags}
        clickRate={clickRate}
        accentClass={meta.accentClass}
        buttonClass={meta.buttonClass}
      />
    </>
  );
}
