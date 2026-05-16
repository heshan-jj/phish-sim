"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DOMPurify from "dompurify";
import { Inbox, Send, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export interface InboxMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  employeeName: string;
  employeeEmail: string;
  subject: string;
  bodyHtml: string;
  previewText: string;
  timestamp: string;
  unread: boolean;
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function buildTrackedHtml(rawHtml: string, token: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");
  const links = doc.querySelectorAll("a[href]");

  links.forEach((anchor) => {
    const href = anchor.getAttribute("href")?.trim();
    if (!href) return;

    const trackedHref = `/api/track?token=${encodeURIComponent(token)}&action=link_clicked&redirect=${encodeURIComponent(href)}`;
    anchor.setAttribute("href", trackedHref);
    anchor.setAttribute("target", "_blank");
    anchor.setAttribute("rel", "noopener noreferrer");
  });

  return DOMPurify.sanitize(doc.body.innerHTML, {
    USE_PROFILES: { html: true },
  });
}

export function InboxClient({
  token,
  message,
}: {
  token: string;
  message: InboxMessage;
}) {
  const [safeHtml, setSafeHtml] = useState("");
  const [reporting, setReporting] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  const timestamp = useMemo(() => formatTimestamp(message.timestamp), [message.timestamp]);
  const avatarInitials = useMemo(() => {
    const parts = message.employeeName.split(" ").filter(Boolean);
    return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  }, [message.employeeName]);

  useEffect(() => {
    setSafeHtml(buildTrackedHtml(message.bodyHtml, token));
  }, [message.bodyHtml, token]);

  useEffect(() => {
    void fetch(`/api/track?token=${encodeURIComponent(token)}&action=email_opened`, {
      method: "POST",
    });
  }, [token]);

  async function handleReportPhishing() {
    setReporting(true);
    try {
      const response = await fetch(
        `/api/track?token=${encodeURIComponent(token)}&action=reported`,
        { method: "POST" },
      );
      if (response.ok) {
        setShowCongrats(true);
      }
    } finally {
      setReporting(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: "#f6f8fc",
        color: "#202124",
        fontFamily:
          '"Google Sans", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
      }}
    >
      <div className="mx-auto flex h-screen max-w-[1600px] gap-4 p-4">
        <aside className="flex w-[256px] flex-col rounded-2xl bg-white shadow-sm">
          <div className="px-6 py-5">
            <p className="text-[22px] font-semibold text-[#1f1f1f]">Mail</p>
          </div>

          <nav className="flex flex-col gap-1 px-3">
            <button
              type="button"
              className="flex items-center gap-3 rounded-r-full bg-[#d3e3fd] px-4 py-2 text-left text-[14px] font-medium text-[#001d35]"
            >
              <Inbox className="size-4" />
              Inbox
              <span className="ml-auto text-[12px]">1</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-3 rounded-r-full px-4 py-2 text-left text-[14px] text-[#3c4043] hover:bg-[#f1f3f4]"
            >
              <Send className="size-4" />
              Sent
            </button>
            <button
              type="button"
              className="flex items-center gap-3 rounded-r-full px-4 py-2 text-left text-[14px] text-[#3c4043] hover:bg-[#f1f3f4]"
            >
              <Trash2 className="size-4" />
              Trash
            </button>
          </nav>

          <div className="mt-auto border-t border-[#eceff1] px-4 py-4">
            <div className="flex items-center gap-3 rounded-xl bg-[#f8fafd] p-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#1a73e8] text-sm font-semibold text-white">
                {avatarInitials || "U"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-[#202124]">
                  {message.employeeName}
                </p>
                <p className="truncate text-[12px] text-[#5f6368]">{message.employeeEmail}</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex flex-1 gap-4 overflow-hidden">
          <section className="flex w-[380px] flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="border-b border-[#eceff1] px-5 py-4">
              <p className="text-sm font-semibold text-[#1f1f1f]">Inbox</p>
            </div>

            <article className="border-l-4 border-l-[#1a73e8] bg-[#f8fbff] px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <p className="truncate text-[14px] font-semibold text-[#202124]">
                  {message.senderName}
                </p>
                <div className="flex items-center gap-2">
                  {message.unread && <span className="size-2 rounded-full bg-[#1a73e8]" />}
                  <span className="text-[12px] text-[#5f6368]">{timestamp}</span>
                </div>
              </div>
              <p className="mt-1 truncate text-[14px] font-medium text-[#202124]">
                {message.subject}
              </p>
              <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[#5f6368]">
                {message.previewText}
              </p>
            </article>
          </section>

          <section className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#eceff1] px-6 py-4">
              <div>
                <p className="text-[20px] font-medium text-[#202124]">{message.subject}</p>
                <p className="mt-1 text-[12px] text-[#5f6368]">1 message</p>
              </div>
              <Button
                type="button"
                onClick={() => void handleReportPhishing()}
                disabled={reporting}
                className="h-9 rounded-full bg-[#1a73e8] px-4 text-[13px] text-white hover:bg-[#1765cc] disabled:bg-[#a8c7fa]"
              >
                {reporting ? "Reporting..." : "Report Phishing"}
              </Button>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              <div className="rounded-xl border border-[#eceff1] p-5">
                <div className="mb-5 flex items-start justify-between gap-3 border-b border-[#eceff1] pb-4">
                  <div>
                    <p className="text-[14px] font-semibold text-[#202124]">
                      {message.senderName}{" "}
                      <span className="font-normal text-[#5f6368]">&lt;{message.senderEmail}&gt;</span>
                    </p>
                    <p className="mt-1 text-[13px] text-[#5f6368]">to {message.employeeEmail}</p>
                  </div>
                  <p className="shrink-0 text-[12px] text-[#5f6368]">{timestamp}</p>
                </div>

                <div
                  className="prose prose-sm max-w-none text-[#202124] [&_a]:text-[#1a73e8] [&_a]:underline [&_a]:underline-offset-2"
                  dangerouslySetInnerHTML={{ __html: safeHtml }}
                />
              </div>
            </div>
          </section>
        </main>
      </div>

      <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Great catch!</DialogTitle>
            <DialogDescription>
              You successfully reported the simulated phishing email. This is exactly the
              right response for suspicious messages.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setShowCongrats(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
