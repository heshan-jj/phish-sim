import { getDashboardStats } from "@/lib/db/queries/dashboard";
import { getOrgForUser } from "@/lib/org";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight, Megaphone, Plus, Users } from "lucide-react";
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

export default async function DashboardPage() {
  const org = await getOrgForUser();
  if (!org) redirect("/login");

  const stats = await getDashboardStats(org.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1
          className="text-[28px] font-[600] leading-[1.25] mb-2"
          style={{ color: "var(--ds-ink)" }}
        >
          Overview
        </h1>
        <p className="text-[14px] leading-[1.50]" style={{ color: "var(--ds-steel)" }}>
          Security awareness at a glance for {org.name}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <p className="text-[13px] font-[500] mb-1" style={{ color: "var(--ds-steel)" }}>
            Employees
          </p>
          <p className="text-[32px] font-[600] leading-none" style={{ color: "var(--ds-ink)" }}>
            {stats.employeeCount}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-[13px] font-[500] mb-1" style={{ color: "var(--ds-steel)" }}>
            Total campaigns
          </p>
          <p className="text-[32px] font-[600] leading-none" style={{ color: "var(--ds-ink)" }}>
            {stats.campaignCount}
          </p>
        </Card>
        <Card className="p-6" style={{ backgroundColor: "var(--ds-lavender)" }}>
          <p className="text-[13px] font-[500] mb-1" style={{ color: "var(--ds-primary)" }}>
            Active
          </p>
          <p className="text-[32px] font-[600] leading-none" style={{ color: "var(--ds-ink)" }}>
            {stats.statusCounts.active}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-[13px] font-[500] mb-1" style={{ color: "var(--ds-steel)" }}>
            Completed
          </p>
          <p className="text-[32px] font-[600] leading-none" style={{ color: "var(--ds-ink)" }}>
            {stats.statusCounts.complete}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[18px]">
              <Users className="size-5" style={{ color: "var(--ds-primary)" }} />
              Employee directory
            </CardTitle>
            <CardDescription>
              Import and manage employees for targeting simulations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/employees">
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-[8px] border-[var(--ds-hairline-strong)]"
              >
                Manage employees
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[18px]">
              <Megaphone className="size-5" style={{ color: "var(--ds-primary)" }} />
              Phishing campaigns
            </CardTitle>
            <CardDescription>
              Launch simulations from templates and track engagement.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link href="/dashboard/campaigns/new">
              <Button
                type="button"
                className="h-11 w-full rounded-[8px]"
                style={{
                  backgroundColor: "var(--ds-primary)",
                  color: "#ffffff",
                }}
              >
                <Plus className="size-4" />
                Create campaign
              </Button>
            </Link>
            <Link href="/dashboard/campaigns">
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-[8px] border-[var(--ds-hairline-strong)]"
              >
                View all campaigns
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-[18px]">Recent campaigns</CardTitle>
            <CardDescription>Latest simulations for your organization.</CardDescription>
          </div>
          <Link
            href="/dashboard/campaigns"
            className="text-[14px] font-[500] shrink-0"
            style={{ color: "var(--ds-link)" }}
          >
            View all
          </Link>
        </CardHeader>
        <CardContent className="pt-0 px-0 pb-0">
          {stats.recentCampaigns.length === 0 ? (
            <div className="px-8 pb-8 text-center">
              <p className="text-[14px] mb-4" style={{ color: "var(--ds-steel)" }}>
                No campaigns yet. Create your first simulation to get started.
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
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell style={{ color: "var(--ds-steel)" }}>
                      {campaign.templateCategory}
                    </TableCell>
                    <TableCell>
                      <span
                        className="inline-flex rounded-[6px] px-2 py-0.5 text-[12px] font-[600]"
                        style={statusStyles(campaign.status)}
                      >
                        {statusLabel(campaign.status)}
                      </span>
                    </TableCell>
                    <TableCell style={{ color: "var(--ds-steel)" }}>
                      {formatDate(campaign.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
