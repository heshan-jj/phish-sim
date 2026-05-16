import { generatePhishingEmail, type GenerationInput } from "@/lib/ai";
import { getAiProvider } from "@/lib/ai-nasiko";
import { listPlatformLogs } from "@/lib/platform-logs";
import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const TEST_INPUT: GenerationInput = {
  employeeName: "Jane Doe",
  employeeRole: "Analyst",
  employeeDepartment: "IT",
  seniority: "mid",
  templateCategory: "credential-harvest",
  difficulty: "medium",
  companyContext: {
    vendors: "Acme Cloud, SecurePay",
    tools: "Microsoft 365, Slack",
    internalTerms: "QBR, ticket queue",
    recentEvents: "Annual security training week",
    orgStructure: "IT reports to CISO",
  },
};

function inferProviderFromLogs(): "nasiko" | "minimax" {
  const recent = listPlatformLogs("ALL").find(
    (row) =>
      row.source === "phish-sim-ai" &&
      (row.message.includes("Nasiko") || row.message.includes("MiniMax")),
  );
  if (recent?.message.includes("MiniMax fallback")) return "minimax";
  if (recent?.message.includes("Nasiko")) return "nasiko";
  return getAiProvider();
}

export async function POST() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await generatePhishingEmail(TEST_INPUT);
    const provider = inferProviderFromLogs();
    return NextResponse.json({
      subject: result.subject,
      bodyPreview: result.body.slice(0, 200),
      provider,
      configuredProvider: getAiProvider(),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Content generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
