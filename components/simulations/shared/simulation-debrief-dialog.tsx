"use client";

import type { DebriefProps } from "@/components/simulations/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useMemo } from "react";

export function SimulationDebriefDialog({
  open,
  onOpenChange,
  senderName,
  senderEmail,
  subject,
  redFlags,
  clickRate,
  coachingTip,
}: DebriefProps) {
  const displayRedFlags = useMemo(() => redFlags.slice(0, 5), [redFlags]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl sm:max-w-xl" showCloseButton>
        <DialogHeader>
          <DialogTitle
            className="text-2xl font-semibold"
            style={{ color: "var(--ds-ink)" }}
          >
            This was a phishing simulation
          </DialogTitle>
          <DialogDescription style={{ color: "var(--ds-steel)" }}>
            You reached a safe training page. No credentials were stored.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div
            className="rounded-lg border p-4 text-sm"
            style={{
              borderColor: "var(--ds-hairline)",
              backgroundColor: "var(--ds-surface)",
            }}
          >
            <p style={{ color: "var(--ds-charcoal)" }}>
              <span className="font-semibold">Original sender:</span> {senderName} (
              {senderEmail})
            </p>
            <p className="mt-1" style={{ color: "var(--ds-charcoal)" }}>
              <span className="font-semibold">Original subject:</span> {subject}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--ds-ink)" }}>
              Red flags in the email
            </p>
            <ul
              className="mt-2 list-disc space-y-1 pl-5 text-sm"
              style={{ color: "var(--ds-slate)" }}
            >
              {displayRedFlags.map((flag) => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
          </div>

          {coachingTip && (
            <p
              className="text-sm rounded-lg border p-3"
              style={{
                color: "var(--ds-slate)",
                borderColor: "var(--ds-hairline)",
                backgroundColor: "var(--ds-surface)",
              }}
            >
              {coachingTip}
            </p>
          )}

          <p className="text-sm" style={{ color: "var(--ds-slate)" }}>
            You&apos;re not alone — {clickRate}% of employees click on emails like this.
          </p>
          <Link
            href="/security-tips"
            className="inline-block text-sm font-semibold ds-interactive-link"
            style={{ color: "var(--ds-link)" }}
          >
            Learn more
          </Link>
        </div>

        <DialogFooter>
          <Button type="button" variant="ds" size="app" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
