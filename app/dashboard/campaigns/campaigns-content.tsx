import { listCampaignsByOrg } from "@/lib/db/queries/campaigns";
import { getTemplateDisplayName } from "@/lib/campaign-templates";
import { requireDashboardOrg } from "@/lib/org";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart2, Plus } from "lucide-react";
import Link from "next/link";

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusStyles(status: string): React.CSSProperties {
  switch (status) {
    case "active":
      return {
        backgroundColor: "var(--ds-lavender)",
        color: "var(--ds-primary)",
      };
    case "complete":
      return {
        backgroundColor: "#d9f3e1",
        color: "#1aae39",
      };
    default:
      return {
        backgroundColor: "var(--ds-surface)",
        color: "var(--ds-charcoal)",
        border: "1px solid var(--ds-hairline)",
      };
  }
}

export async function CampaignsContent() {
  const org = await requireDashboardOrg();
  const campaigns = await listCampaignsByOrg(org.id);

  if (campaigns.length === 0) {
    return (
      <div className="px-8 py-16 text-center">
        <h2
          className="text-[18px] font-[600] mb-2"
          style={{ color: "var(--ds-ink)" }}
        >
          No campaigns yet
        </h2>
        <p
          className="text-[14px] leading-[1.50] mb-6 max-w-md mx-auto"
          style={{ color: "var(--ds-steel)" }}
        >
          Create a campaign from a template to start training your team.
        </p>
        <Button
          variant="ds"
          size="app"
          render={<Link href="/dashboard/campaigns/new" />}
        >
          <Plus className="size-4" />
          Create campaign
        </Button>
      </div>
    );
  }

  return (
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
        {campaigns.map((campaign) => (
          <TableRow key={campaign.id}>
            <TableCell className="font-medium">{campaign.name}</TableCell>
            <TableCell style={{ color: "var(--ds-steel)" }}>
              {getTemplateDisplayName(campaign.templateCategory)}
            </TableCell>
            <TableCell>{campaign.difficulty}</TableCell>
            <TableCell>
              <span
                className="inline-flex rounded-[6px] px-2 py-0.5 text-[12px] font-[600]"
                style={statusStyles(campaign.status)}
              >
                {statusLabel(campaign.status)}
              </span>
            </TableCell>
            <TableCell style={{ color: "var(--ds-steel)" }}>
              {formatDate(campaign.schedule)}
            </TableCell>
            <TableCell style={{ color: "var(--ds-steel)" }}>
              {formatDate(campaign.createdAt)}
            </TableCell>
            <TableCell>
              <Link
                href={`/dashboard/campaigns/${campaign.id}/analytics`}
                className="ds-interactive-link inline-flex items-center gap-1.5 text-[12px] font-[500]"
                style={{ color: "var(--ds-link)" }}
              >
                <BarChart2 className="size-3.5" />
                Analytics
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
