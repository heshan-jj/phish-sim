"use client";

import type { LandingPageType } from "@/lib/campaign-templates";
import { useCallback, useEffect, useState } from "react";

export function useSimulationTracking({
  token,
  campaignId,
  variant,
}: {
  token: string;
  campaignId: string;
  variant: LandingPageType;
}) {
  const [startedAt] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [showDebrief, setShowDebrief] = useState(false);

  useEffect(() => {
    void fetch(
      `/api/track?token=${encodeURIComponent(token)}&action=landing_page_viewed`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          action: "landing_page_viewed",
          metadata: { campaignId, landingPageType: variant },
        }),
      },
    );
  }, [campaignId, token, variant]);

  const submitCredentials = useCallback(
    async (email: string, password: string) => {
      setSubmitting(true);
      try {
        await fetch(
          `/api/track?token=${encodeURIComponent(token)}&action=credentials_submitted`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token,
              action: "credentials_submitted",
              metadata: {
                campaignId,
                enteredEmail: email.trim().length > 0,
                enteredPassword: password.length > 0,
                timeToSubmit: Math.max(
                  0,
                  Math.round((Date.now() - startedAt) / 1000),
                ),
              },
            }),
          },
        );
      } finally {
        setSubmitting(false);
        setShowDebrief(true);
        void fetch(
          `/api/track?token=${encodeURIComponent(token)}&action=training_viewed`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token,
              action: "training_viewed",
              metadata: { campaignId },
            }),
          },
        );
      }
    },
    [campaignId, startedAt, token],
  );

  return {
    submitting,
    showDebrief,
    setShowDebrief,
    submitCredentials,
  };
}
