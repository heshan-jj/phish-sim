import { listCampaignsByOrg } from "@/lib/db/queries/campaigns";
import { getTemplateDisplayName } from "@/lib/campaign-templates";
import { requireDashboardOrg } from "@/lib/org";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { CampaignsClient } from "./campaigns-client";

export async function CampaignsContent() {
  const org = await requireDashboardOrg();
  const rows = await listCampaignsByOrg(org.id);

  if (rows.length === 0) {
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
        <Link href="/dashboard/campaigns/new">
          <Button
            type="button"
            className="h-11 rounded-[8px] px-6"
            style={{ backgroundColor: "var(--ds-primary)", color: "#ffffff" }}
          >
            <Plus className="size-4" />
            Create campaign
          </Button>
        </Link>
      </div>
    );
  }

  const campaigns = rows.map((c) => ({
    id: c.id,
    name: c.name,
    templateCategory: c.templateCategory,
    templateLabel: getTemplateDisplayName(c.templateCategory),
    difficulty: c.difficulty,
    status: c.status,
    schedule: c.schedule,
    createdAt: c.createdAt,
  }));

  return <CampaignsClient campaigns={campaigns} />;
}
