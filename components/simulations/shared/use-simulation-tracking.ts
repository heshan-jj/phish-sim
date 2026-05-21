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
    ).then((response) => {
      // #region agent log
      fetch('http://127.0.0.1:7729/ingest/c8d9804c-28f9-4d81-aea6-a8b23bc1b28a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6df5d8'},body:JSON.stringify({sessionId:'6df5d8',runId:'pre-fix',hypothesisId:'H2,H3',location:'components/simulations/shared/use-simulation-tracking.ts:33',message:'client landing tracking response',data:{ok:response.ok,status:response.status},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
    }).catch((error: unknown) => {
      // #region agent log
      fetch('http://127.0.0.1:7729/ingest/c8d9804c-28f9-4d81-aea6-a8b23bc1b28a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6df5d8'},body:JSON.stringify({sessionId:'6df5d8',runId:'pre-fix',hypothesisId:'H2',location:'components/simulations/shared/use-simulation-tracking.ts:37',message:'client landing tracking failed',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
    });
  }, [campaignId, token, variant]);

  const submitCredentials = useCallback(
    async (email: string, password: string) => {
      setSubmitting(true);
      try {
        const response = await fetch(
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
        // #region agent log
        fetch('http://127.0.0.1:7729/ingest/c8d9804c-28f9-4d81-aea6-a8b23bc1b28a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6df5d8'},body:JSON.stringify({sessionId:'6df5d8',runId:'pre-fix',hypothesisId:'H2,H3,H4,H5',location:'components/simulations/shared/use-simulation-tracking.ts:69',message:'client credential tracking response',data:{ok:response.ok,status:response.status},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
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
        ).then((response) => {
          // #region agent log
          fetch('http://127.0.0.1:7729/ingest/c8d9804c-28f9-4d81-aea6-a8b23bc1b28a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6df5d8'},body:JSON.stringify({sessionId:'6df5d8',runId:'pre-fix',hypothesisId:'H1,H2,H3',location:'components/simulations/shared/use-simulation-tracking.ts:91',message:'client training tracking response',data:{ok:response.ok,status:response.status},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
        }).catch((error: unknown) => {
          // #region agent log
          fetch('http://127.0.0.1:7729/ingest/c8d9804c-28f9-4d81-aea6-a8b23bc1b28a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6df5d8'},body:JSON.stringify({sessionId:'6df5d8',runId:'pre-fix',hypothesisId:'H2',location:'components/simulations/shared/use-simulation-tracking.ts:95',message:'client training tracking failed',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
        });
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
