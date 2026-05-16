"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { BarChart2, Trash2, AlertTriangle, Trophy } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { deleteCampaign, deleteAllCampaigns } from "./_actions";
import { getCampaignStatusStyle } from "@/lib/ui/campaign-status-style";

export interface CampaignListItem {
  id: string;
  name: string;
  templateCategory: string;
  templateLabel: string;
  difficulty: string;
  status: string;
  schedule: Date | null;
  createdAt: Date;
}

interface Props {
  campaigns: CampaignListItem[];
}

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function CampaignsClient({ campaigns: initial }: Props) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState(initial);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDeleteClick(id: string) {
    setConfirmId(id);
  }

  function handleCancelDelete() {
    setConfirmId(null);
  }

  function handleConfirmDelete(id: string) {
    startTransition(async () => {
      const { error } = await deleteCampaign(id);
      if (error) {
        toast.error(`Failed to delete campaign: ${error}`);
      } else {
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
        toast.success("Campaign deleted");
        router.refresh();
      }
      setConfirmId(null);
    });
  }

  function handleConfirmDeleteAll() {
    startTransition(async () => {
      const { deleted, error } = await deleteAllCampaigns();
      if (error) {
        toast.error(`Failed to delete campaigns: ${error}`);
      } else {
        setCampaigns([]);
        toast.success(`Deleted ${deleted} campaign${deleted !== 1 ? "s" : ""}`);
        router.refresh();
      }
      setConfirmDeleteAll(false);
    });
  }

  return (
    <div>
      {confirmDeleteAll && (
        <div
          className="flex flex-col gap-3 px-5 py-3 border-b text-[13px] sm:flex-row sm:items-center sm:justify-between"
          style={{
            backgroundColor: "var(--ds-tint-rose)",
            borderColor: "#fca5a5",
          }}
        >
          <div className="flex items-start gap-3 min-w-0">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" style={{ color: "var(--ds-error)" }} />
            <span className="font-[500]" style={{ color: "#7f1d1d" }}>
              This will permanently delete all {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} and their data. This cannot be undone.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
            <Button
              size="sm"
              disabled={isPending}
              onClick={handleConfirmDeleteAll}
              className="h-7 rounded-[6px] px-3 text-[11px] font-[600]"
              style={{ backgroundColor: "var(--ds-error)", color: "#fff" }}
            >
              {isPending ? "Deleting…" : `Yes, delete all ${campaigns.length}`}
            </Button>
            <button
              type="button"
              onClick={() => setConfirmDeleteAll(false)}
              disabled={isPending}
              className="text-[11px] font-[500] hover:underline"
              style={{ color: "#991b1b" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-10 bg-[var(--ds-canvas)]">Name</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Created</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => {
              const isConfirming = confirmId === campaign.id;
              const isDeleting = isPending && confirmId === campaign.id;

              return (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium sticky left-0 z-10 bg-[var(--ds-canvas)]">
                    {campaign.name}
                  </TableCell>
                  <TableCell style={{ color: "var(--ds-steel)" }}>
                    {campaign.templateLabel}
                  </TableCell>
                  <TableCell style={{ color: "var(--ds-charcoal)" }}>
                    {campaign.difficulty}
                  </TableCell>
                  <TableCell>
                    <span
                      className="inline-flex rounded-[6px] px-2 py-0.5 text-[12px] font-[600]"
                      style={getCampaignStatusStyle(campaign.status)}
                    >
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell style={{ color: "var(--ds-steel)" }}>
                    {formatDate(campaign.schedule)}
                  </TableCell>
                  <TableCell style={{ color: "var(--ds-steel)" }}>
                    {formatDate(campaign.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-3">
                      {!isConfirming ? (
                        <>
                          <Link
                            href={`/dashboard/campaigns/${campaign.id}/analytics`}
                            className="ds-interactive-link inline-flex items-center gap-1.5 text-[12px] font-[500]"
                            style={{ color: "var(--ds-link)" }}
                          >
                            <BarChart2 className="size-3.5" />
                            Analytics
                          </Link>
                          <Link
                            href={`/dashboard/campaigns/${campaign.id}/leaderboard`}
                            className="ds-interactive-link inline-flex items-center gap-1.5 text-[12px] font-[500]"
                            style={{ color: "var(--ds-link)" }}
                          >
                            <Trophy className="size-3.5" />
                            Leaderboard
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(campaign.id)}
                            className="inline-flex items-center justify-center rounded-[6px] p-1.5 transition-colors hover:bg-[var(--ds-tint-rose)]"
                            style={{ color: "var(--ds-stone)" }}
                            title="Delete campaign"
                            aria-label="Delete campaign"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="size-3.5 shrink-0" style={{ color: "var(--ds-warning)" }} />
                          <span className="text-[12px] font-[500]" style={{ color: "var(--ds-charcoal)" }}>
                            Delete?
                          </span>
                          <Button
                            size="sm"
                            disabled={isDeleting}
                            onClick={() => handleConfirmDelete(campaign.id)}
                            className="h-7 rounded-[6px] px-2.5 text-[11px] font-[600]"
                            style={{ backgroundColor: "var(--ds-error)", color: "#fff" }}
                          >
                            {isDeleting ? "Deleting…" : "Yes, delete"}
                          </Button>
                          <button
                            type="button"
                            onClick={handleCancelDelete}
                            disabled={isDeleting}
                            className="text-[11px] font-[500] hover:underline"
                            style={{ color: "var(--ds-steel)" }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div
        className="flex items-center justify-between px-4 py-3 border-t text-[13px]"
        style={{ borderColor: "var(--ds-hairline)" }}
      >
        <span style={{ color: "var(--ds-steel)" }}>
          {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}
        </span>
        {!confirmDeleteAll && (
          <button
            type="button"
            onClick={() => setConfirmDeleteAll(true)}
            disabled={isPending || campaigns.length === 0}
            className="inline-flex items-center gap-1.5 text-[12px] font-[500] hover:underline disabled:opacity-40"
            style={{ color: "var(--ds-error)" }}
          >
            <Trash2 className="size-3.5" />
            Delete all
          </button>
        )}
      </div>
    </div>
  );
}
