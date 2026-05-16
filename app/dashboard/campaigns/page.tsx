import { listCampaignsByOrg } from "@/lib/db/queries/campaigns";
import { getTemplateDisplayName } from "@/lib/campaign-templates";
import { getOrgForUser } from "@/lib/org";
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
import { redirect } from "next/navigation";

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

export default async function CampaignsPage() {
  const org = await getOrgForUser();
  if (!org) redirect("/login");

  const campaigns = await listCampaignsByOrg(org.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1
            className="text-[28px] font-[600] leading-[1.25] mb-2"
            style={{ color: "var(--ds-ink)" }}
          >
            Campaigns
          </h1>
          <p className="text-[14px] leading-[1.50]" style={{ color: "var(--ds-steel)" }}>
            View and manage phishing simulation campaigns.
          </p>
        </div>
        <Link href="/dashboard/campaigns/new" className="shrink-0">
          <Button
            type="button"
            className="h-11 rounded-[8px] px-4"
            style={{
              backgroundColor: "var(--ds-primary)",
              color: "#ffffff",
            }}
          >
            <Plus className="size-4" />
            New campaign
          </Button>
        </Link>
      </div>

      <div
        className="rounded-[12px] border overflow-hidden"
        style={{
          backgroundColor: "var(--ds-canvas)",
          borderColor: "var(--ds-hairline)",
        }}
      >
        {campaigns.length === 0 ? (
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
            <Link href="/dashboard/campaigns/new">
              <Button
                type="button"
                className="h-11 rounded-[8px] px-6"
                style={{
                  backgroundColor: "var(--ds-primary)",
                  color: "#ffffff",
                }}
              >
                <Plus className="size-4" />
                Create campaign
              </Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
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
                      className="inline-flex items-center gap-1.5 text-[12px] font-[500] hover:underline"
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
        )}
      </div>
    </div>
  );
}
