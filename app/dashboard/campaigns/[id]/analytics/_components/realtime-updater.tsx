"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/browser";

interface Props {
  campaignId: string;
}

/**
 * Subscribes to the Supabase Realtime broadcast channel for this campaign and
 * calls router.refresh() whenever a new tracking event is received, keeping
 * the server-rendered analytics data fresh without a full page reload.
 */
export function RealtimeUpdater({ campaignId }: Props) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`campaign:${campaignId}`)
      .on("broadcast", { event: "event_tracked" }, () => {
        router.refresh();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [campaignId, router]);

  return null;
}
