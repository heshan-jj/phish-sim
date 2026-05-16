"use client";

import { SIMULATION_VARIANTS } from "@/components/simulations/registry";
import { SimulationDebriefDialog } from "@/components/simulations/shared/simulation-debrief-dialog";
import { useSimulationTracking } from "@/components/simulations/shared/use-simulation-tracking";
import { VARIANT_META } from "@/components/simulations/variant-meta";
import type { LandingPageType } from "@/lib/campaign-templates";
import { useEffect, useState } from "react";

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
  const [coachingTip, setCoachingTip] = useState<string | null>(null);

  useEffect(() => {
    if (!showDebrief) return;
    fetch("/api/training/coaching", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action: "compromised" }),
    })
      .then((r) => r.json())
      .then((d: { message?: string }) => setCoachingTip(d.message ?? null))
      .catch(() => setCoachingTip(null));
  }, [showDebrief, token]);

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
        coachingTip={coachingTip}
        accentClass={meta.accentClass}
        buttonClass={meta.buttonClass}
      />
    </>
  );
}
