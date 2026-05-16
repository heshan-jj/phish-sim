"use client";

import Link from "next/link";
import { useEffect } from "react";

interface SmsSimulationClientProps {
  token: string;
  campaignId: string;
  message: string;
  senderLabel: string;
  loginUrl: string;
}

export function SmsSimulationClient({
  token,
  campaignId,
  message,
  senderLabel,
  loginUrl,
}: SmsSimulationClientProps) {
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        action: "link_clicked",
      }),
    }).catch(console.error);
  }, [token, campaignId]);

  return (
    <main className="min-h-screen bg-[#e5e5ea] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <p className="text-center text-xs text-gray-500 mb-4">
          Smishing simulation — training only
        </p>
        <div className="rounded-3xl bg-white shadow-lg overflow-hidden">
          <div className="bg-[#f6f6f6] px-4 py-3 border-b text-sm font-medium">
            Messages
          </div>
          <div className="p-4 space-y-3 min-h-[200px]">
            <p className="text-xs text-gray-500 text-center">{senderLabel}</p>
            <div className="bg-[#007aff] text-white rounded-2xl rounded-bl-sm px-4 py-2 text-sm max-w-[85%] ml-auto">
              {message}
            </div>
            <p className="text-xs text-gray-400 text-right">Delivered</p>
          </div>
          <div className="p-4 border-t bg-gray-50">
            <Link
              href={loginUrl}
              className="block text-center text-sm text-[#007aff] font-medium"
            >
              Open link from message →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
