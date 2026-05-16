"use client";

import { useCallback, useState } from "react";

export function useLoginSteps<T extends string>(steps: readonly T[]) {
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[stepIndex] ?? steps[0];
  const isLast = stepIndex >= steps.length - 1;

  const next = useCallback(() => {
    setStepIndex((index) => Math.min(index + 1, steps.length - 1));
  }, [steps.length]);

  const back = useCallback(() => {
    setStepIndex((index) => Math.max(index - 1, 0));
  }, []);

  return {
    currentStep,
    stepIndex,
    isLast,
    next,
    back,
    canGoBack: stepIndex > 0,
  };
}
