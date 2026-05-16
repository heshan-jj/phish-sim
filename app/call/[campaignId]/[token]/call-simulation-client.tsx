"use client";

import { Button } from "@/components/ui/button";
import { Phone, PhoneOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface CallSimulationClientProps {
  token: string;
  callerName: string;
  callerRole: string;
  script: string;
  loginUrl: string;
}

export function CallSimulationClient({
  token,
  callerName,
  callerRole,
  script,
  loginUrl,
}: CallSimulationClientProps) {
  const [answered, setAnswered] = useState(false);
  const [ended, setEnded] = useState(false);

  async function track(action: "call_answered" | "call_hung_up") {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action }),
    }).catch(console.error);
  }

  async function handleAnswer() {
    setAnswered(true);
    await track("call_answered");
  }

  async function handleHangUp() {
    setEnded(true);
    await track("call_hung_up");
  }

  return (
    <main className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-[#1e293b] p-8 shadow-xl">
        <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
          Vishing simulation
        </p>
        <h1 className="text-2xl font-semibold mb-1">{callerName}</h1>
        <p className="text-slate-400 text-sm mb-6">{callerRole}</p>

        {!answered && !ended && (
          <div className="flex flex-col gap-4 items-center">
            <div className="h-24 w-24 rounded-full bg-[#334155] flex items-center justify-center animate-pulse">
              <Phone className="h-10 w-10" />
            </div>
            <Button type="button" onClick={() => void handleAnswer()} className="w-full">
              Answer call
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleHangUp()}
              className="w-full border-slate-600 text-white"
            >
              Decline
            </Button>
          </div>
        )}

        {answered && !ended && (
          <div className="space-y-4">
            <pre className="whitespace-pre-wrap text-sm text-slate-200 bg-[#0f172a] rounded-lg p-4 max-h-64 overflow-y-auto">
              {script}
            </pre>
            <p className="text-xs text-slate-400">
              This is a training script. The caller may ask you to verify credentials.
            </p>
            <Link href={loginUrl}>
              <Button type="button" className="w-full" variant="secondary">
                Continue to credential page (simulated)
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleHangUp()}
              className="w-full border-slate-600 text-white"
            >
              <PhoneOff className="mr-2 h-4 w-4" />
              End call
            </Button>
          </div>
        )}

        {ended && (
          <p className="text-center text-slate-300 text-sm">
            Call ended. This was a security awareness simulation.
          </p>
        )}
      </div>
    </main>
  );
}
