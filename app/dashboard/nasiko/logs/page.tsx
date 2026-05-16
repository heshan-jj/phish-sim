import { PlatformLogsPanel } from "@/components/nasiko/platform-logs-panel";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import NasikoLogsLoading from "./loading";

export const metadata: Metadata = {
  title: "Nasiko platform logs",
};

export default function NasikoPlatformLogsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[13px] font-[500] mb-4 ds-interactive-link"
          style={{ color: "var(--ds-link)" }}
        >
          <ArrowLeft className="size-3.5" />
          Back to overview
        </Link>
        <h1
          className="text-[28px] font-[600] leading-[1.25] mb-2"
          style={{ color: "var(--ds-ink)" }}
        >
          Nasiko platform logs
        </h1>
        <p className="text-[14px] leading-[1.50]" style={{ color: "var(--ds-steel)" }}>
          Nasiko gateway health, agent registry probes, and PhishSim AI activity.
          Filter by level or source, refresh to probe your VPS, or run a test
          generation.
        </p>
      </div>

      <Suspense fallback={<NasikoLogsLoading />}>
        <PlatformLogsPanel />
      </Suspense>
    </div>
  );
}
