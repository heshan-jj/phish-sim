import { generateCoachingTip, generateReportFeedback } from "@/lib/ai-extended";
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function isJsonRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isJsonRecord(body)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";
  const action =
    body.action === "compromised" || body.action === "reported"
      ? body.action
      : null;

  if (!token || !action) {
    return NextResponse.json(
      { error: "token and action (compromised|reported) required" },
      { status: 400 },
    );
  }

  const supabase = createServiceRoleClient() ?? (await createServerClient());

  const { data: events, error } = await supabase
    .from("campaign_events")
    .select("id,metadata,employee_id")
    .contains("metadata", { token })
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !events?.[0]) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const event = events[0];
  const metadata = isJsonRecord(event.metadata) ? event.metadata : {};
  const cached =
    typeof metadata.coachingTip === "string" ? metadata.coachingTip : null;
  if (cached) {
    return NextResponse.json({ message: cached });
  }

  const { data: employee } = await supabase
    .from("employees")
    .select("department,role")
    .eq("id", event.employee_id)
    .maybeSingle();

  const phishingEmail = isJsonRecord(metadata.phishingEmail)
    ? metadata.phishingEmail
    : {};
  const subject =
    typeof phishingEmail.subject === "string"
      ? phishingEmail.subject
      : "Simulated phishing email";

  const department = employee?.department ?? "General";
  const role = employee?.role ?? "Employee";

  try {
    const message =
      action === "reported"
        ? await generateReportFeedback({ department, role })
        : await generateCoachingTip({
            department,
            role,
            actionTaken: "compromised",
            emailSubject: subject,
          });

    await supabase
      .from("campaign_events")
      .update({
        metadata: { ...metadata, coachingTip: message },
      })
      .eq("id", event.id);

    return NextResponse.json({ message });
  } catch {
    const fallback =
      action === "reported"
        ? "Great job reporting this message. Keep verifying sender domains before acting on urgent requests."
        : "Next time, verify the sender through a known channel before entering credentials from an email link.";
    return NextResponse.json({ message: fallback });
  }
}
