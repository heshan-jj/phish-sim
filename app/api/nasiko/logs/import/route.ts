import { importDockerLogText } from "@/lib/platform-logs";
import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const text = (body as { text?: unknown }).text;
  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json(
      { error: "Field 'text' must be a non-empty string" },
      { status: 400 },
    );
  }

  const imported = importDockerLogText(text);
  return NextResponse.json({ imported });
}
