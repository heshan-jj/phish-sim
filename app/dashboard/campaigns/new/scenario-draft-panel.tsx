"use client";

import { suggestScenarioDraftAction } from "@/app/dashboard/campaigns/new/_actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { ContentMode } from "@/lib/campaign-settings";
import type { CampaignDifficulty } from "@/lib/campaign-templates";

interface ScenarioDraftPanelProps {
  onApply: (result: {
    templateId: string;
    difficulty: CampaignDifficulty;
    contentMode: ContentMode;
  }) => void;
}

export function ScenarioDraftPanel({ onApply }: ScenarioDraftPanelProps) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    templateId: string;
    difficulty: CampaignDifficulty;
    contentMode: ContentMode;
    sampleSubject: string;
    rationale: string;
  } | null>(null);

  async function handleDraft() {
    setLoading(true);
    setError(null);
    try {
      const result = await suggestScenarioDraftAction(description);
      setDraft({
        templateId: result.templateId,
        difficulty: result.difficulty,
        contentMode: result.contentMode,
        sampleSubject: result.sampleSubject,
        rationale: result.rationale,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Draft failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="rounded-[12px] border p-6 flex flex-col gap-3 mb-6"
      style={{ borderColor: "var(--ds-hairline)", backgroundColor: "var(--ds-surface-soft)" }}
    >
      <p className="text-[14px] font-[600]" style={{ color: "var(--ds-ink)" }}>
        Describe a scenario (optional)
      </p>
      <Textarea
        placeholder="e.g. Fake DocuSign renewal for the legal team after our office move"
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Button
        type="button"
        variant="dsOutline"
        size="sm"
        className="self-start"
        disabled={loading || !description.trim()}
        onClick={() => void handleDraft()}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Suggest template"}
      </Button>
      {error && (
        <p className="text-[13px]" style={{ color: "var(--ds-error)" }}>
          {error}
        </p>
      )}
      {draft && (
        <div className="text-[13px] space-y-2" style={{ color: "var(--ds-slate)" }}>
          <p>{draft.rationale}</p>
          <p>
            <strong>Subject:</strong> {draft.sampleSubject}
          </p>
          <Button
            type="button"
            variant="ds"
            size="sm"
            onClick={() =>
              onApply({
                templateId: draft.templateId,
                difficulty: draft.difficulty,
                contentMode: draft.contentMode,
              })
            }
          >
            Use this suggestion
          </Button>
        </div>
      )}
    </div>
  );
}
