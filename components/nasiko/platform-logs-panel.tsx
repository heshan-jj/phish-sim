"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PlatformLogEntry, PlatformLogLevel } from "@/lib/platform-logs";

type LevelFilter = PlatformLogLevel | "ALL";

type LogsResponse = {
  logs: PlatformLogEntry[];
  level: LevelFilter;
  counts: { INFO: number; WARNING: number; ERROR: number };
  total: number;
  nasikoUiUrl: string | null;
};

function levelBadgeVariant(level: PlatformLogLevel) {
  switch (level) {
    case "ERROR":
      return "destructive" as const;
    case "WARNING":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

function formatTimestamp(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function PlatformLogsPanel() {
  const [level, setLevel] = useState<LevelFilter>("ALL");
  const [data, setData] = useState<LogsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback((opts?: { refresh?: boolean }) => {
    startTransition(async () => {
      setError(null);
      try {
        const params = new URLSearchParams({ level });
        if (opts?.refresh) {
          params.set("refresh", "1");
        }
        const response = await fetch(`/api/nasiko/logs?${params}`);
        const body = (await response.json()) as LogsResponse & {
          error?: string;
        };
        if (!response.ok) {
          throw new Error(body.error ?? `HTTP ${response.status}`);
        }
        setData(body);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  }, [level]);

  useEffect(() => {
    load({ refresh: true });
  }, [load]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label
            className="text-[13px] font-[500]"
            style={{ color: "var(--ds-steel)" }}
            htmlFor="log-level"
          >
            Log level
          </label>
          <Select
            id="log-level"
            value={level}
            onChange={(e) => setLevel(e.target.value as LevelFilter)}
            className="sm:w-44"
          >
            <option value="ALL">All levels</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
          </Select>
        </div>

        <Button
          type="button"
          variant="ds"
          size="app"
          disabled={pending}
          onClick={() => load({ refresh: true })}
        >
          <RefreshCw className={`size-4 ${pending ? "animate-spin" : ""}`} />
          Refresh snapshot
        </Button>
      </div>

      {data && (
        <p
          className="text-[13px]"
          style={{ color: "var(--ds-steel)" }}
        >
          Showing {data.logs.length} of {data.total} entries — INFO {data.counts.INFO},
          WARNING {data.counts.WARNING}, ERROR {data.counts.ERROR}
        </p>
      )}

      {error && (
        <p
          className="text-[14px] rounded-[8px] border px-3 py-2"
          style={{
            color: "var(--ds-ink)",
            borderColor: "var(--ds-hairline)",
            backgroundColor: "var(--ds-surface)",
          }}
        >
          {error}
        </p>
      )}

      <div
        className="rounded-[12px] border overflow-hidden"
        style={{
          backgroundColor: "var(--ds-canvas)",
          borderColor: "var(--ds-hairline)",
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Timestamp</TableHead>
              <TableHead className="w-[100px]">Level</TableHead>
              <TableHead className="w-[140px]">Source</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pending && !data?.logs.length ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  Loading platform logs…
                </TableCell>
              </TableRow>
            ) : null}
            {!pending && data?.logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No logs for this filter. Run an AI campaign or click Refresh snapshot.
                </TableCell>
              </TableRow>
            ) : null}
            {data?.logs.map((row) => (
              <TableRow key={row.id}>
                <TableCell
                  className="font-mono text-[12px]"
                  style={{ color: "var(--ds-steel)" }}
                >
                  {formatTimestamp(row.timestamp)}
                </TableCell>
                <TableCell>
                  <Badge variant={levelBadgeVariant(row.level)}>{row.level}</Badge>
                </TableCell>
                <TableCell
                  className="font-mono text-[12px]"
                  style={{ color: "var(--ds-charcoal)" }}
                >
                  {row.source}
                </TableCell>
                <TableCell
                  className="whitespace-normal text-[13px] leading-[1.45] max-w-xl"
                  style={{ color: "var(--ds-ink)" }}
                >
                  {row.message}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data?.nasikoUiUrl ? (
        <p className="text-[13px]" style={{ color: "var(--ds-steel)" }}>
          Nasiko control plane:{" "}
          <a
            href={data.nasikoUiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: "var(--ds-primary)" }}
          >
            open Nasiko UI
          </a>
        </p>
      ) : null}
    </div>
  );
}
