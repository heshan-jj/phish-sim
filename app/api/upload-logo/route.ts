import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { createServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const file = formData.get("logo");
  if (!file || !(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Logo must be 2 MB or smaller" },
      { status: 400 },
    );
  }

  const ALLOWED_TYPES = new Set([
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
  ]);

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Only PNG, JPEG, GIF, and WebP are allowed." },
      { status: 400 },
    );
  }

  const fileName = file instanceof File ? file.name : "logo";
  const ext = fileName.split(".").pop() ?? "png";
  const path = `${user.id}/logo.${ext}`;
  const contentType = file.type || "application/octet-stream";

  const serviceRoleClient = createServiceRoleClient();
  const storageClient = serviceRoleClient ?? supabase;

  const { error: uploadError } = await storageClient.storage
    .from("logos")
    .upload(path, file, { upsert: true, contentType });

  if (uploadError) {
    console.error("[upload-logo]", uploadError);
    const hint = !serviceRoleClient
      ? " Set SUPABASE_SERVICE_ROLE_KEY or add a Storage INSERT policy for the logos bucket."
      : "";
    return NextResponse.json(
      { error: `Upload failed: ${uploadError.message}.${hint}` },
      { status: 500 },
    );
  }

  const { data: urlData } = supabase.storage
    .from("logos")
    .getPublicUrl(path);
  const publicUrl = urlData.publicUrl;

  await db
    .update(organizations)
    .set({ logoUrl: publicUrl })
    .where(eq(organizations.userId, user.id));

  return NextResponse.json({ url: publicUrl });
}
