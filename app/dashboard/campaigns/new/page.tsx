"use client";

import { NewCampaignWizard } from "@/app/dashboard/campaigns/new/new-campaign-wizard";
import { Suspense } from "react";

function NewCampaignWizardFallback() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <h1
        className="text-[28px] font-[600] leading-[1.25] mb-2"
        style={{ color: "var(--ds-ink)" }}
      >
        Create campaign
      </h1>
      <p className="text-[14px]" style={{ color: "var(--ds-steel)" }}>
        Loading…
      </p>
    </div>
  );
}

export default function NewCampaignPage() {
  return (
    <Suspense fallback={<NewCampaignWizardFallback />}>
      <NewCampaignWizard />
    </Suspense>
  );
}
