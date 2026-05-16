import type { CampaignSettings } from "@/lib/campaign-settings";
import { db } from "@/lib/db";
import { getEmployeesByOrg } from "@/lib/db/queries/employees";
import { campaigns, organizations } from "@/lib/db/schema";
import { createServerClient } from "@/lib/supabase/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [org] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.userId, user.id))
    .limit(1);

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, id), eq(campaigns.orgId, org.id)))
    .limit(1);

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (campaign.status !== "active") {
    return NextResponse.json(
      { error: "Campaign must be active to send" },
      { status: 400 },
    );
  }

  const settings = campaign.settings as CampaignSettings | null;
  if (!settings) {
    return NextResponse.json(
      { error: "Campaign settings missing" },
      { status: 400 },
    );
  }

  const allEmployees = await getEmployeesByOrg(org.id);
  let recipients = allEmployees;

  if (settings.targetMode === "departments" && settings.departments?.length) {
    const deptSet = new Set(settings.departments);
    recipients = allEmployees.filter(
      (e) => e.department && deptSet.has(e.department),
    );
  } else if (
    settings.targetMode === "employees" &&
    settings.employeeIds?.length
  ) {
    const idSet = new Set(settings.employeeIds);
    recipients = allEmployees.filter((e) => idSet.has(e.id));
  }

  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "No recipients matched targeting rules" },
      { status: 400 },
    );
  }

  // Stub: real dispatch would queue emails with optional stagger window
  console.info(
    `[campaign-send] campaign=${id} recipients=${recipients.length} stagger=${settings.staggerSends}`,
  );

  return NextResponse.json({
    ok: true,
    recipientCount: recipients.length,
    staggerSends: settings.staggerSends,
  });
}
