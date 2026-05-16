"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NasikoSetupCard() {
  return (
    <Card
      className="border"
      style={{
        borderColor: "var(--ds-hairline)",
        backgroundColor: "var(--ds-surface)",
      }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-[16px] font-[600]" style={{ color: "var(--ds-ink)" }}>
          Nasiko not configured
        </CardTitle>
      </CardHeader>
      <CardContent className="text-[13px] leading-[1.5]" style={{ color: "var(--ds-steel)" }}>
        <p className="mb-3">
          Add these to <code className="font-mono text-[12px]">.env.local</code> (see{" "}
          <code className="font-mono text-[12px]">.env.local.example</code>):
        </p>
        <ul className="list-disc pl-5 space-y-1 font-mono text-[12px]">
          <li>AI_PROVIDER=nasiko</li>
          <li>NASIKO_BASE_URL=http://&lt;vps&gt;:9100</li>
          <li>NASIKO_ACCESS_KEY / NASIKO_ACCESS_SECRET</li>
          <li>NASIKO_AGENT_ROUTE (recommended)</li>
          <li>MINIMAX_API_KEY (fallback)</li>
        </ul>
        <p className="mt-3">
          Deploy the PhishSim agent zip from{" "}
          <code className="font-mono text-[12px]">agents/a2a-phish-sim-content</code>, then
          click Refresh snapshot.
        </p>
      </CardContent>
    </Card>
  );
}
