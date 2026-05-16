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
  accentClass = "text-[#2563eb]",
  buttonClass = "bg-[#2563eb] hover:bg-[#1d4ed8]",
}: DebriefProps) {
  const displayRedFlags = useMemo(() => redFlags.slice(0, 5), [redFlags]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl sm:max-w-xl" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-[#151515]">
            This was a phishing simulation
          </DialogTitle>
          <DialogDescription className="text-black/70">
            You reached a safe training page. No credentials were stored.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div>
            <div className="rounded-lg border border-black/10 bg-black/[0.02] p-4 text-sm">
              <p>
                <span className="font-semibold">Original sender:</span> {senderName} (
                {senderEmail})
              </p>
              <p className="mt-1">
                <span className="font-semibold">Original subject:</span> {subject}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-black">Red flags in the email</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-black/80">
                {displayRedFlags.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            </div>

            {coachingTip && (
              <p className="text-sm text-black/80 mt-3 rounded-lg border border-black/10 bg-black/[0.02] p-3">
                {coachingTip}
              </p>
            )}

            <p className="text-sm text-black/80 mt-3">
              You&apos;re not alone — {clickRate}% of employees click on emails like this.
            </p>
            <a
              href="/security-tips"
              className={`inline-block text-sm font-semibold ${accentClass} hover:underline`}
            >
              Learn more
            </a>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            className={`text-white ${buttonClass}`}
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
