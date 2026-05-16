import { refreshNasikoPlatformLogs } from "@/lib/nasiko-platform-snapshot";
import {
  listPlatformLogs,
  type PlatformLogLevel,
} from "@/lib/platform-logs";
import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const LEVELS = new Set<PlatformLogLevel | "ALL">([
  "ALL",
  "INFO",
  "WARNING",
  "ERROR",
]);

export async function GET(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const levelParam = (searchParams.get("level") ?? "ALL").toUpperCase();
  const level = LEVELS.has(levelParam as PlatformLogLevel | "ALL")
    ? (levelParam as PlatformLogLevel | "ALL")
    : "ALL";
  const refresh = searchParams.get("refresh") === "1";

  let snapshot = { appended: 0, configured: true };
  if (refresh) {
    snapshot = await refreshNasikoPlatformLogs();
  }

  const logs = listPlatformLogs(level);
  const counts = {
    INFO: listPlatformLogs("INFO").length,
    WARNING: listPlatformLogs("WARNING").length,
    ERROR: listPlatformLogs("ERROR").length,
  };

  return NextResponse.json({
    logs,
    level,
    counts,
    total: listPlatformLogs("ALL").length,
    snapshot,
    nasikoUiUrl: process.env.NASIKO_BASE_URL
      ? `${process.env.NASIKO_BASE_URL.replace(/\/$/, "")}/app/`
      : null,
  });
}
