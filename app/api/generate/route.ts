import {
  generatePhishingEmail,
  generateVoiceScript,
  type CompanyContext,
  type GenerationInput,
} from "@/lib/ai";
import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const DIFFICULTIES = new Set(["easy", "medium", "hard"]);
const GENERATION_TYPES = new Set(["email", "voice"]);
const CONTEXT_FIELDS = [
  "vendors",
  "tools",
  "internalTerms",
  "recentEvents",
  "orgStructure",
] as const;

export async function POST(request: Request) {
  // ── Auth check ──────────────────────────────────────────────────────────────
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Request body must be a JSON object" },
      { status: 400 },
    );
  }

  const { type, input } = body as Record<string, unknown>;

  // ── Validate `type` ─────────────────────────────────────────────────────────
  if (typeof type !== "string" || !GENERATION_TYPES.has(type)) {
    return NextResponse.json(
      { error: "Field 'type' must be 'email' or 'voice'" },
      { status: 400 },
    );
  }

  // ── Validate `input` ────────────────────────────────────────────────────────
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return NextResponse.json(
      { error: "Field 'input' must be a JSON object" },
      { status: 400 },
    );
  }

  const inp = input as Record<string, unknown>;

  for (const field of [
    "employeeName",
    "employeeRole",
    "employeeDepartment",
    "seniority",
    "templateCategory",
  ] as const) {
    if (typeof inp[field] !== "string" || !(inp[field] as string).trim()) {
      return NextResponse.json(
        { error: `Missing or empty required field: input.${field}` },
        { status: 400 },
      );
    }
  }

  if (typeof inp.difficulty !== "string" || !DIFFICULTIES.has(inp.difficulty)) {
    return NextResponse.json(
      { error: "input.difficulty must be 'easy', 'medium', or 'hard'" },
      { status: 400 },
    );
  }

  if (
    !inp.companyContext ||
    typeof inp.companyContext !== "object" ||
    Array.isArray(inp.companyContext)
  ) {
    return NextResponse.json(
      { error: "Field 'input.companyContext' must be a JSON object" },
      { status: 400 },
    );
  }

  const ctx = inp.companyContext as Record<string, unknown>;
  for (const field of CONTEXT_FIELDS) {
    if (typeof ctx[field] !== "string") {
      return NextResponse.json(
        { error: `Missing required field: input.companyContext.${field}` },
        { status: 400 },
      );
    }
  }

  // ── Build typed input ────────────────────────────────────────────────────────
  const companyContext: CompanyContext = {
    vendors: ctx.vendors as string,
    tools: ctx.tools as string,
    internalTerms: ctx.internalTerms as string,
    recentEvents: ctx.recentEvents as string,
    orgStructure: ctx.orgStructure as string,
  };

  const generationInput: GenerationInput = {
    employeeName: inp.employeeName as string,
    employeeRole: inp.employeeRole as string,
    employeeDepartment: inp.employeeDepartment as string,
    seniority: inp.seniority as string,
    templateCategory: inp.templateCategory as string,
    difficulty: inp.difficulty as "easy" | "medium" | "hard",
    companyContext,
  };

  // ── Generate ─────────────────────────────────────────────────────────────────
  try {
    if (type === "email") {
      const result = await generatePhishingEmail(generationInput);
      return NextResponse.json(result);
    } else {
      const result = await generateVoiceScript(generationInput);
      return NextResponse.json(result);
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Content generation failed";
    console.error("[api/generate]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
