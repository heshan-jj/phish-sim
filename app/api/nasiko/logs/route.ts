import { refreshNasikoPlatformLogs } from "@/lib/nasiko-platform-snapshot";
import { buildNasikoLogsStatus } from "@/lib/nasiko-logs-status";
import {
  clearPlatformLogs,
  getPlatformLogCounts,
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

async function requireUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET(request: Request) {
  const user = await requireUser();
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
  let lastRefresh: {
    at: string;
    appended: number;
    configured: boolean;
  } | null = null;

  if (refresh) {
    snapshot = await refreshNasikoPlatformLogs();
    lastRefresh = {
      at: new Date().toISOString(),
      appended: snapshot.appended,
      configured: snapshot.configured,
    };
  }

  const counts = getPlatformLogCounts();
  const status = buildNasikoLogsStatus();

  return NextResponse.json({
    logs: listPlatformLogs(level),
    level,
    counts,
    total: listPlatformLogs("ALL").length,
    snapshot,
    lastRefresh,
    status,
    nasikoUiUrl: status.nasikoUiUrl,
  });
}

export async function DELETE() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  clearPlatformLogs();
  return NextResponse.json({ cleared: true });
}
