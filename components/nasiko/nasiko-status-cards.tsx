"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PlatformLogLevel } from "@/lib/platform-logs";
import type { NasikoLogsStatus } from "@/lib/nasiko-logs-status";
import { Check, X } from "lucide-react";

type LevelFilter = PlatformLogLevel | "ALL";

type Props = {
  status: NasikoLogsStatus;
  counts: { INFO: number; WARNING: number; ERROR: number };
  total: number;
  level: LevelFilter;
  onLevelChange: (level: LevelFilter) => void;
};

function ConfigRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-[13px]">
      {ok ? (
        <Check className="size-3.5 shrink-0" style={{ color: "#1aae39" }} />
      ) : (
        <X className="size-3.5 shrink-0" style={{ color: "var(--ds-steel)" }} />
      )}
      <span style={{ color: ok ? "var(--ds-ink)" : "var(--ds-steel)" }}>{label}</span>
    </li>
  );
}

export function NasikoStatusCards({
  status,
  counts,
  total,
  level,
  onLevelChange,
}: Props) {
  const providerLabel =
    status.provider === "nasiko" ? "Nasiko" : "MiniMax";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="p-5">
        <p className="text-[13px] font-[500] mb-2" style={{ color: "var(--ds-steel)" }}>
          AI provider
        </p>
        <div className="flex items-center gap-2">
          <p
            className="text-[24px] font-[600] leading-none capitalize"
            style={{ color: "var(--ds-ink)" }}
          >
            {providerLabel}
          </p>
          <Badge variant="outline" className="text-[11px]">
            AI_PROVIDER
          </Badge>
        </div>
        <p className="text-[12px] mt-2" style={{ color: "var(--ds-steel)" }}>
          {status.minimaxConfigured
            ? "MiniMax fallback available"
            : "No MiniMax key for fallback"}
        </p>
      </Card>

      <Card className="p-5">
        <p className="text-[13px] font-[500] mb-2" style={{ color: "var(--ds-steel)" }}>
          Nasiko config
        </p>
        <ul className="flex flex-col gap-1">
          <ConfigRow ok={status.nasikoConfigured} label="URL & credentials" />
          <ConfigRow ok={status.agentRouteSet} label="Direct agent route" />
        </ul>
        {status.nasikoBaseUrl ? (
          <p
            className="text-[12px] mt-2 font-mono truncate"
            style={{ color: "var(--ds-steel)" }}
            title={status.nasikoBaseUrl}
          >
            {status.nasikoBaseUrl}
          </p>
        ) : null}
      </Card>

      <Card className="p-5">
        <p className="text-[13px] font-[500] mb-2" style={{ color: "var(--ds-steel)" }}>
          Log levels
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["INFO", counts.INFO],
              ["WARNING", counts.WARNING],
              ["ERROR", counts.ERROR],
            ] as const
          ).map(([lvl, count]) => (
            <button
              key={lvl}
              type="button"
              onClick={() => onLevelChange(level === lvl ? "ALL" : lvl)}
              className="rounded-[8px] border px-2.5 py-1 text-[12px] font-[600] transition-colors"
              style={{
                borderColor:
                  level === lvl ? "var(--ds-primary)" : "var(--ds-hairline)",
                backgroundColor:
                  level === lvl ? "var(--ds-lavender)" : "var(--ds-surface)",
                color: level === lvl ? "var(--ds-primary)" : "var(--ds-charcoal)",
              }}
            >
              {lvl} {count}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-[13px] font-[500] mb-1" style={{ color: "var(--ds-steel)" }}>
          Total entries
        </p>
        <p className="text-[32px] font-[600] leading-none" style={{ color: "var(--ds-ink)" }}>
          {total}
        </p>
        <p className="text-[12px] mt-2" style={{ color: "var(--ds-steel)" }}>
          {status.sources.length} source
          {status.sources.length !== 1 ? "s" : ""} in buffer
        </p>
      </Card>
    </div>
  );
}
