export type PlatformLogLevel = "INFO" | "WARNING" | "ERROR";

export type PlatformLogEntry = {
  id: string;
  timestamp: string;
  level: PlatformLogLevel;
  source: string;
  message: string;
};

const MAX_LOGS = 500;

const globalForLogs = globalThis as unknown as {
  platformLogs?: PlatformLogEntry[];
};

function store(): PlatformLogEntry[] {
  if (!globalForLogs.platformLogs) {
    globalForLogs.platformLogs = [];
  }
  return globalForLogs.platformLogs;
}

export function appendPlatformLog(
  entry: Omit<PlatformLogEntry, "id" | "timestamp"> &
    Partial<Pick<PlatformLogEntry, "timestamp">>,
): PlatformLogEntry {
  const row: PlatformLogEntry = {
    id: crypto.randomUUID(),
    timestamp: entry.timestamp ?? new Date().toISOString(),
    level: entry.level,
    source: entry.source,
    message: entry.message,
  };

  const logs = store();
  logs.unshift(row);
  if (logs.length > MAX_LOGS) {
    logs.length = MAX_LOGS;
  }

  return row;
}

export function listPlatformLogs(
  level: PlatformLogLevel | "ALL" = "ALL",
): PlatformLogEntry[] {
  const logs = store();
  if (level === "ALL") {
    return [...logs];
  }
  return logs.filter((row) => row.level === level);
}

export function getPlatformLogCounts(): Record<PlatformLogLevel, number> {
  const logs = store();
  let info = 0;
  let warning = 0;
  let error = 0;
  for (const row of logs) {
    if (row.level === "INFO") info += 1;
    else if (row.level === "WARNING") warning += 1;
    else error += 1;
  }
  return { INFO: info, WARNING: warning, ERROR: error };
}

export function getPlatformLogSources(): string[] {
  const sources = new Set<string>();
  for (const row of store()) {
    sources.add(row.source);
  }
  return [...sources].sort();
}

export function clearPlatformLogs(): void {
  const logs = store();
  logs.length = 0;
}

export function importDockerLogText(text: string): number {
  const lines = text.split(/\r?\n/);
  let imported = 0;
  for (const line of lines) {
    const row = parseDockerLogLine(line);
    if (!row) continue;
    appendPlatformLog({
      level: row.level,
      source: row.source,
      message: row.message,
      timestamp: row.timestamp,
    });
    imported += 1;
  }
  return imported;
}

export function inferLogLevel(
  message: string,
  options?: { httpOk?: boolean },
): PlatformLogLevel {
  if (options?.httpOk === false) {
    return "ERROR";
  }

  const lower = message.toLowerCase();
  if (
    /\bwarn/.test(lower) ||
    /\bfallback\b/.test(lower) ||
    /\bdegraded\b/.test(lower)
  ) {
    return "WARNING";
  }

  if (
    /\berror\b/.test(lower) ||
    /\bfailed\b/.test(lower) ||
    /\bunhealthy\b/.test(lower) ||
    /\bcrash/.test(lower)
  ) {
    return "ERROR";
  }

  return "INFO";
}

export function parseDockerLogLine(line: string): PlatformLogEntry | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const isoMatch = trimmed.match(
    /^(\d{4}-\d{2}-\d{2}T[\d:.]+Z?)\s+(.*)$/,
  );
  const bracketMatch = trimmed.match(
    /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+(.*)$/,
  );

  let timestamp = new Date().toISOString();
  let message = trimmed;

  if (isoMatch) {
    timestamp = isoMatch[1]!.endsWith("Z") ? isoMatch[1]! : `${isoMatch[1]}Z`;
    message = isoMatch[2]!;
  } else if (bracketMatch) {
    timestamp = new Date(bracketMatch[1]!.replace(" ", "T") + "Z").toISOString();
    message = bracketMatch[2]!;
  }

  const levelMatch = message.match(/\b(INFO|WARNING|ERROR|WARN|ERR)\b/);
  let level: PlatformLogLevel = "INFO";
  if (levelMatch) {
    const token = levelMatch[1]!;
    if (token === "ERROR" || token === "ERR") level = "ERROR";
    else if (token === "WARNING" || token === "WARN") level = "WARNING";
  } else {
    level = inferLogLevel(message);
  }

  const sourceMatch = message.match(/^\[([^\]]+)\]/);
  const source = sourceMatch?.[1] ?? "platform";

  if (sourceMatch) {
    message = message.slice(sourceMatch[0].length).trim();
  }

  return {
    id: crypto.randomUUID(),
    timestamp,
    level,
    source,
    message: message || trimmed,
  };
}
