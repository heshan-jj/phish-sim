"use client";

import { CheckCircle2 } from "lucide-react";

const TOTAL_STEPS = 3;
const STEP_LABELS = ["Template", "Settings", "Review & launch"];

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const step = i + 1;
        const isComplete = step < current;
        const isActive = step === current;

        return (
          <div key={step} className="flex items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-[600] transition-all duration-200"
              style={{
                backgroundColor: isActive
                  ? "var(--ds-primary)"
                  : isComplete
                    ? "var(--ds-primary)"
                    : "var(--ds-hairline)",
                color:
                  isActive || isComplete ? "#ffffff" : "var(--ds-stone)",
              }}
            >
              {isComplete ? <CheckCircle2 size={14} /> : step}
            </div>
            {step < TOTAL_STEPS && (
              <div
                className="w-16 h-px transition-colors"
                style={{
                  backgroundColor: isComplete
                    ? "var(--ds-primary)"
                    : "var(--ds-hairline)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function StepLabel({ step }: { step: number }) {
  return (
    <p
      className="text-center text-[13px] font-[500] mb-6 -mt-4 transition-opacity duration-200"
      style={{ color: "var(--ds-stone)" }}
    >
      Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}
    </p>
  );
}
