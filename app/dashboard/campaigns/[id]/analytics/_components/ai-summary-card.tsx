"use client";

import { refreshCampaignAiSummary } from "@/app/dashboard/campaigns/[id]/analytics/_actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface AiSummaryCardProps {
  initialSummary: string | null;
  generatedAt: string | null;
}

export function AiSummaryCard({ initialSummary, generatedAt }: AiSummaryCardProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [at, setAt] = useState(generatedAt);
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    setLoading(true);
    try {
      const path = window.location.pathname;
      const match = path.match(/\/campaigns\/([^/]+)\/analytics/);
      const campaignId = match?.[1];
      if (!campaignId) return;
      const text = await refreshCampaignAiSummary(campaignId);
      setSummary(text);
      setAt(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h2 className="text-[16px] font-[600]" style={{ color: "var(--ds-ink)" }}>
            AI executive summary
          </h2>
          {at && (
            <p className="text-[12px] mt-0.5" style={{ color: "var(--ds-steel)" }}>
              Generated {new Date(at).toLocaleString()}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="dsOutline"
          size="sm"
          onClick={() => void handleRefresh()}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
        </Button>
      </div>
      <p className="text-[14px] leading-relaxed" style={{ color: "var(--ds-slate)" }}>
        {summary ??
          "No summary yet. Click Refresh to generate an AI narrative from campaign metrics."}
      </p>
    </Card>
  );
}
