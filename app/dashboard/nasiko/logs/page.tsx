import { PlatformLogsPanel } from "@/components/nasiko/platform-logs-panel";

export default function NasikoPlatformLogsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="text-[28px] font-[600] leading-[1.25] mb-2"
          style={{ color: "var(--ds-ink)" }}
        >
          Nasiko platform logs
        </h1>
        <p className="text-[14px] leading-[1.50]" style={{ color: "var(--ds-steel)" }}>
          Recent Nasiko gateway, registry, and agent health events plus PhishSim AI
          activity. Filter by log level or refresh to probe your VPS.
        </p>
      </div>

      <PlatformLogsPanel />
    </div>
  );
}
