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

function statusStyles(status: string): React.CSSProperties {
  switch (status) {
    case "active":
      return { backgroundColor: "var(--ds-lavender)", color: "var(--ds-primary)" };
    case "complete":
      return { backgroundColor: "#d9f3e1", color: "#1aae39" };
    default:
      return {
        backgroundColor: "var(--ds-surface)",
        color: "var(--ds-charcoal)",
        border: "1px solid var(--ds-hairline)",
      };
  }
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
      {/* Delete-all confirmation banner */}
      {confirmDeleteAll && (
        <div
          className="flex items-center gap-3 px-5 py-3 border-b text-[13px]"
          style={{
            backgroundColor: "#fde0ec",
            borderColor: "#fca5a5",
          }}
        >
          <AlertTriangle className="size-4 shrink-0" style={{ color: "#e03131" }} />
          <span className="font-[500]" style={{ color: "#7f1d1d" }}>
            This will permanently delete all {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} and their data. This cannot be undone.
          </span>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              disabled={isPending}
              onClick={handleConfirmDeleteAll}
              className="h-7 rounded-[6px] px-3 text-[11px] font-[600]"
              style={{ backgroundColor: "#e03131", color: "#fff" }}
            >
              {isPending ? "Deleting…" : `Yes, delete all ${campaigns.length}`}
            </Button>
            <button
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

      <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
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
              <TableCell className="font-medium">{campaign.name}</TableCell>
              <TableCell style={{ color: "var(--ds-steel)" }}>
                {campaign.templateLabel}
              </TableCell>
              <TableCell style={{ color: "var(--ds-charcoal)" }}>
                {campaign.difficulty}
              </TableCell>
              <TableCell>
                <span
                  className="inline-flex rounded-[6px] px-2 py-0.5 text-[12px] font-[600]"
                  style={statusStyles(campaign.status)}
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
                        onClick={() => handleDeleteClick(campaign.id)}
                        className="inline-flex items-center justify-center rounded-[6px] p-1.5 transition-colors hover:bg-[#fde0ec]"
                        style={{ color: "var(--ds-stone)" }}
                        title="Delete campaign"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="size-3.5 shrink-0" style={{ color: "#dd5b00" }} />
                      <span className="text-[12px] font-[500]" style={{ color: "var(--ds-charcoal)" }}>
                        Delete?
                      </span>
                      <Button
                        size="sm"
                        disabled={isDeleting}
                        onClick={() => handleConfirmDelete(campaign.id)}
                        className="h-7 rounded-[6px] px-2.5 text-[11px] font-[600]"
                        style={{ backgroundColor: "#e03131", color: "#fff" }}
                      >
                        {isDeleting ? "Deleting…" : "Yes, delete"}
                      </Button>
                      <button
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

      {/* Footer: count + delete-all trigger */}
      <div
        className="flex items-center justify-between px-4 py-3 border-t text-[13px]"
        style={{ borderColor: "var(--ds-hairline)" }}
      >
        <span style={{ color: "var(--ds-steel)" }}>
          {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}
        </span>
        {!confirmDeleteAll && (
          <button
            onClick={() => setConfirmDeleteAll(true)}
            disabled={isPending || campaigns.length === 0}
            className="inline-flex items-center gap-1.5 text-[12px] font-[500] hover:underline disabled:opacity-40"
            style={{ color: "#e03131" }}
          >
            <Trash2 className="size-3.5" />
            Delete all
          </button>
        )}
      </div>
    </div>
  );
}
