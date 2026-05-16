"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { NasikoStatusCards } from "@/components/nasiko/nasiko-status-cards";
import { NasikoSetupCard } from "@/components/nasiko/nasiko-setup-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DashboardTableSkeleton } from "@/components/dashboard/dashboard-table-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { NasikoLogsStatus } from "@/lib/nasiko-logs-status";
import type { PlatformLogEntry, PlatformLogLevel } from "@/lib/platform-logs";

type LevelFilter = PlatformLogLevel | "ALL";

type LogsResponse = {
  logs: PlatformLogEntry[];
  level: LevelFilter;
  counts: { INFO: number; WARNING: number; ERROR: number };
  total: number;
  nasikoUiUrl: string | null;
  status: NasikoLogsStatus;
  snapshot?: { appended: number; configured: boolean };
  lastRefresh?: { at: string; appended: number; configured: boolean } | null;
};

const AUTO_REFRESH_MS = 30_000;

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

function formatRelative(iso: string) {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const sec = Math.round(diff / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.round(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.round(min / 60);
    if (hr < 48) return `${hr}h ago`;
    return formatTimestamp(iso);
  } catch {
    return iso;
  }
}

function healthSummary(logs: PlatformLogEntry[]): string | null {
  const gateway = logs.find((r) => r.source === "nasiko-gateway");
  const backend = logs.find((r) => r.source === "nasiko-backend");
  if (!gateway && !backend) return null;
  const parts: string[] = [];
  if (gateway) parts.push(`Gateway: ${gateway.message.slice(0, 80)}`);
  if (backend) parts.push(`API: ${backend.message.slice(0, 80)}`);
  return parts.join(" · ");
}

export function PlatformLogsPanel() {
  const [level, setLevel] = useState<LevelFilter>("ALL");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [data, setData] = useState<LogsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [confirmClear, setConfirmClear] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importPending, setImportPending] = useState(false);
  const [testPending, setTestPending] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const load = useCallback(
    (opts?: { refresh?: boolean; silent?: boolean }) => {
      startTransition(async () => {
        if (!opts?.silent) setError(null);
        try {
          const params = new URLSearchParams({ level });
          if (opts?.refresh) params.set("refresh", "1");
          const response = await fetch(`/api/nasiko/logs?${params}`);
          const body = (await response.json()) as LogsResponse & {
            error?: string;
          };
          if (!response.ok) {
            throw new Error(body.error ?? `HTTP ${response.status}`);
          }
          setData(body);
          if (opts?.refresh && body.snapshot && body.snapshot.appended > 0) {
            toast.success(`Snapshot refreshed — ${body.snapshot.appended} new entries`);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (!opts?.silent) setError(msg);
        }
      });
    },
    [level],
  );

  useEffect(() => {
    load({ refresh: true });
  }, [load]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      if (document.hidden) return;
      load({ refresh: true, silent: true });
    }, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [autoRefresh, load]);

  const filteredLogs = useMemo(() => {
    if (!data?.logs) return [];
    const q = search.trim().toLowerCase();
    return data.logs.filter((row) => {
      if (sourceFilter !== "all" && row.source !== sourceFilter) return false;
      if (!q) return true;
      return (
        row.message.toLowerCase().includes(q) ||
        row.source.toLowerCase().includes(q)
      );
    });
  }, [data?.logs, search, sourceFilter]);

  const sources = useMemo(() => {
    const fromStatus = data?.status.sources ?? [];
    const fromLogs = data?.logs.map((r) => r.source) ?? [];
    return [...new Set([...fromStatus, ...fromLogs])].sort();
  }, [data?.status.sources, data?.logs]);

  async function handleClear() {
    try {
      const response = await fetch("/api/nasiko/logs", { method: "DELETE" });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? `HTTP ${response.status}`);
      }
      setConfirmClear(false);
      toast.success("Logs cleared");
      load({ refresh: false });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nasiko-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredLogs.length} entries`);
  }

  async function handleImport() {
    setImportPending(true);
    try {
      const response = await fetch("/api/nasiko/logs/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: importText }),
      });
      const body = (await response.json()) as { imported?: number; error?: string };
      if (!response.ok) throw new Error(body.error ?? `HTTP ${response.status}`);
      toast.success(`Imported ${body.imported ?? 0} lines`);
      setImportText("");
      setImportOpen(false);
      load({ refresh: false });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setImportPending(false);
    }
  }

  async function handleTestGenerate() {
    setTestPending(true);
    try {
      const response = await fetch("/api/nasiko/test-generate", { method: "POST" });
      const body = (await response.json()) as {
        subject?: string;
        provider?: string;
        error?: string;
      };
      if (!response.ok) throw new Error(body.error ?? `HTTP ${response.status}`);
      toast.success(
        `Generated via ${body.provider ?? "AI"}: ${body.subject?.slice(0, 60) ?? "OK"}`,
      );
      load({ refresh: false });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setTestPending(false);
    }
  }

  async function copyRow(row: PlatformLogEntry) {
    const line = `${row.timestamp} | ${row.level} | ${row.source} | ${row.message}`;
    try {
      await navigator.clipboard.writeText(line);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy");
    }
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const summary = data ? healthSummary(data.logs) : null;

  return (
    <div className="flex flex-col gap-6">
      {data?.status ? (
        <NasikoStatusCards
          status={data.status}
          counts={data.counts}
          total={data.total}
          level={level}
          onLevelChange={setLevel}
        />
      ) : null}

      {data?.status && !data.status.nasikoConfigured ? <NasikoSetupCard /> : null}

      {summary ? (
        <p className="text-[13px] -mt-2" style={{ color: "var(--ds-steel)" }}>
          Latest health: {summary}
        </p>
      ) : null}

      {confirmClear ? (
        <div
          className="flex flex-col gap-3 px-5 py-3 rounded-[12px] border text-[13px] sm:flex-row sm:items-center sm:justify-between"
          style={{
            backgroundColor: "var(--ds-tint-rose)",
            borderColor: "#fca5a5",
          }}
        >
          <div className="flex items-start gap-3 min-w-0">
            <AlertTriangle
              className="size-4 shrink-0 mt-0.5"
              style={{ color: "var(--ds-error)" }}
            />
            <span className="font-[500]" style={{ color: "#7f1d1d" }}>
              Clear all in-memory platform logs? This cannot be undone.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
            <Button
              size="sm"
              type="button"
              onClick={() => void handleClear()}
              className="h-7 rounded-[6px] px-3 text-[11px] font-[600]"
              style={{ backgroundColor: "var(--ds-error)", color: "#fff" }}
            >
              Yes, clear all
            </Button>
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              className="text-[11px] font-[500] hover:underline"
              style={{ color: "#7f1d1d" }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--ds-steel)" }}
            />
            <Input
              type="search"
              placeholder="Search message or source…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search logs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="log-level" className="text-[13px]">
              Level
            </Label>
            <Select
              id="log-level"
              value={level}
              onChange={(e) => setLevel(e.target.value as LevelFilter)}
              className="sm:w-36"
            >
              <option value="ALL">All levels</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="log-source" className="text-[13px]">
              Source
            </Label>
            <Select
              id="log-source"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="sm:w-44"
            >
              <option value="all">All sources</option>
              {sources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-2 pb-0.5">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh" className="text-[13px] cursor-pointer">
              Auto-refresh (30s)
            </Label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
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
          <Button
            type="button"
            variant="ds"
            size="app"
            disabled={testPending}
            onClick={() => void handleTestGenerate()}
          >
            <Sparkles className={`size-4 ${testPending ? "animate-pulse" : ""}`} />
            Run test generation
          </Button>
          <Button
            type="button"
            variant="ds"
            size="app"
            disabled={!filteredLogs.length}
            onClick={handleExport}
          >
            <Download className="size-4" />
            Export
          </Button>
          {!confirmClear ? (
            <Button
              type="button"
              variant="ds"
              size="app"
              onClick={() => setConfirmClear(true)}
            >
              <Trash2 className="size-4" />
              Clear logs
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ds"
            size="app"
            onClick={() => setImportOpen((v) => !v)}
          >
            {importOpen ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
            Paste container logs
          </Button>
        </div>
      </div>

      {importOpen ? (
        <Card className="p-4 flex flex-col gap-3">
          <Textarea
            placeholder="Paste docker / container log lines…"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={5}
            className="font-mono text-[12px]"
          />
          <Button
            type="button"
            variant="ds"
            size="app"
            disabled={importPending || !importText.trim()}
            onClick={() => void handleImport()}
            className="self-start"
          >
            Import lines
          </Button>
        </Card>
      ) : null}

      {data ? (
        <p className="text-[13px]" style={{ color: "var(--ds-steel)" }}>
          Showing {filteredLogs.length} of {data.logs.length} loaded ({data.total}{" "}
          total in buffer)
          {data.lastRefresh
            ? ` — last snapshot ${formatRelative(data.lastRefresh.at)} (+${data.lastRefresh.appended})`
            : null}
        </p>
      ) : null}

      {error ? (
        <div
          className="rounded-[8px] border px-3 py-2"
          style={{
            borderColor: "var(--ds-hairline)",
            backgroundColor: "var(--ds-surface)",
          }}
        >
          <FormError>{error}</FormError>
        </div>
      ) : null}

      <div
        className="rounded-[12px] border overflow-hidden"
        style={{
          backgroundColor: "var(--ds-canvas)",
          borderColor: "var(--ds-hairline)",
        }}
      >
        <div className="overflow-x-auto">
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Time</TableHead>
                <TableHead className="w-[90px]">Level</TableHead>
                <TableHead className="w-[140px]">Source</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-[48px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending && !data?.logs.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <DashboardTableSkeleton rows={6} />
                  </TableCell>
                </TableRow>
              ) : null}
              {!pending && filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-[14px]"
                    style={{ color: "var(--ds-steel)" }}
                  >
                    No logs match this filter. Run test generation or refresh snapshot.
                  </TableCell>
                </TableRow>
              ) : null}
              {filteredLogs.map((row) => {
                const expanded = expandedIds.has(row.id);
                return (
                  <TableRow key={row.id}>
                    <TableCell
                      className="font-mono text-[12px]"
                      style={{ color: "var(--ds-steel)" }}
                      title={formatTimestamp(row.timestamp)}
                    >
                      {formatRelative(row.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={levelBadgeVariant(row.level)}>
                        {row.level}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="font-mono text-[12px]"
                      style={{ color: "var(--ds-charcoal)" }}
                    >
                      {row.source}
                    </TableCell>
                    <TableCell
                      className="whitespace-normal text-[13px] leading-[1.45] max-w-xl cursor-pointer"
                      style={{ color: "var(--ds-ink)" }}
                      onClick={() => toggleExpand(row.id)}
                    >
                      <span className={expanded ? "" : "line-clamp-2"}>
                        {row.message}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => void copyRow(row)}
                        className="rounded-[6px] p-1.5 hover:bg-[var(--ds-surface)]"
                        aria-label="Copy log line"
                      >
                        <Copy className="size-3.5" style={{ color: "var(--ds-steel)" }} />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {data?.nasikoUiUrl ? (
        <p className="text-[13px]" style={{ color: "var(--ds-steel)" }}>
          Nasiko control plane:{" "}
          <a
            href={data.nasikoUiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline ds-interactive-link"
            style={{ color: "var(--ds-primary)" }}
          >
            open Nasiko UI
          </a>
        </p>
      ) : null}
    </div>
  );
}
