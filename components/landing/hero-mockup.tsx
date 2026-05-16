"use client";

import { motion, useReducedMotion } from "framer-motion";

function EmailPreview() {
  return (
    <div className="mt-3 hidden sm:block border border-[#e5e3df] rounded-[8px] p-3 bg-[#fafaf9] text-xs">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-[#e6e0f5] flex items-center justify-center text-[10px] font-semibold text-[#5645d4]">
          IT
        </div>
        <div>
          <div className="font-medium text-[#37352f]">IT Security Team</div>
          <div className="text-[#787671]">it-security@company.com</div>
        </div>
      </div>
      <div className="font-medium text-[#37352f] mb-1">🔐 Urgent: Verify your account credentials</div>
      <div className="text-[#5d5b54] leading-relaxed">
        Your account requires immediate verification. Please{" "}
        <span className="text-[#dd5b00] underline cursor-pointer font-medium">click here</span>
        {" "}to confirm your identity.
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#d9f3e1] text-[#1aae39] text-[10px] font-semibold">
          ✓ Reported
        </span>
        <span className="text-[#a4a097]">Training complete</span>
      </div>
    </div>
  );
}

export function HeroMockup() {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 48 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.5 }}
      className="w-full max-w-[min(100%,360px)] sm:max-w-lg md:max-w-3xl mx-auto"
    >
      <div
        className="bg-white rounded-[12px] border border-[#e5e3df] overflow-hidden w-full"
        style={{ boxShadow: "0 32px 64px rgba(0, 0, 0, 0.45)" }}
      >
        <div className="flex items-center gap-1.5 px-3 sm:px-4 py-3 bg-[#f6f5f4] border-b border-[#e5e3df]">
          <div className="w-3 h-3 rounded-full bg-[#e5e3df]" />
          <div className="w-3 h-3 rounded-full bg-[#e5e3df]" />
          <div className="w-3 h-3 rounded-full bg-[#e5e3df]" />
          <div className="ml-2 sm:ml-3 flex-1 min-w-0 h-5 bg-white rounded-[4px] border border-[#e5e3df] flex items-center px-2">
            <span className="text-[10px] text-[#a4a097] truncate">app.phishsim.io/dashboard</span>
          </div>
        </div>

        <div className="flex min-h-[280px] sm:min-h-[320px] md:min-h-[400px]">
          <div className="hidden md:flex flex-col w-[180px] shrink-0 border-r border-[#e5e3df] bg-[#fafaf9] p-3 gap-1">
            <div className="text-[11px] font-semibold text-[#a4a097] uppercase tracking-wide px-2 mb-1">Workspace</div>
            {[
              { label: "Overview", active: false },
              { label: "Employees", active: false },
              { label: "Campaigns", active: true },
            ].map((item) => (
              <div
                key={item.label}
                className={`px-2 py-1.5 rounded-[6px] text-sm font-medium cursor-default ${
                  item.active
                    ? "bg-[#e6e0f5] text-[#5645d4]"
                    : "text-[#5d5b54] hover:bg-[#f6f5f4]"
                }`}
              >
                {item.label}
              </div>
            ))}
            <div className="mt-auto pt-4 space-y-2">
              <div className="text-[10px] font-semibold text-[#a4a097] uppercase tracking-wide px-2">Stats</div>
              {[
                { label: "Employees", value: "248" },
                { label: "Open rate", value: "12%" },
                { label: "Click rate", value: "3%" },
                { label: "Reported", value: "89%" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between px-2">
                  <span className="text-xs text-[#787671]">{s.label}</span>
                  <span className="text-xs font-semibold text-[#37352f]">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 p-3 sm:p-4 overflow-hidden min-w-0">
            <div className="flex md:hidden gap-2 mb-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {["Overview", "Employees", "Campaigns"].map((tab, i) => (
                <div
                  key={tab}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border whitespace-nowrap ${
                    i === 2
                      ? "bg-[#5645d4] text-white border-[#5645d4]"
                      : "text-[#787671] border-[#e5e3df]"
                  }`}
                >
                  {tab}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4 md:hidden">
              {[
                { label: "Employees", value: "248" },
                { label: "Open rate", value: "12%" },
                { label: "Click rate", value: "3%" },
                { label: "Reported", value: "89%" },
              ].map((s) => (
                <div key={s.label} className="bg-[#f6f5f4] rounded-[8px] p-2">
                  <div className="text-sm font-semibold text-[#37352f]">{s.value}</div>
                  <div className="text-[10px] text-[#787671]">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="text-xs font-semibold text-[#a4a097] uppercase tracking-wide mb-2">Campaigns</div>

            <div className="space-y-2">
              {[
                {
                  name: "Q2 Executive Phish",
                  status: "Active",
                  badge: "bg-[#e6e0f5] text-[#391c57]",
                  sent: "124",
                  clicks: "4",
                },
                {
                  name: "New Hire Onboarding",
                  status: "Complete",
                  badge: "bg-[#d9f3e1] text-[#1aae39]",
                  sent: "36",
                  clicks: "2",
                },
                {
                  name: "IT Credential Sweep",
                  status: "Draft",
                  badge: "bg-[#f0eeec] text-[#787671]",
                  sent: "—",
                  clicks: "—",
                },
              ].map((row) => (
                <div
                  key={row.name}
                  className="flex items-center justify-between py-2 px-3 rounded-[8px] bg-[#fafaf9] border border-[#ede9e4] gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-[#37352f] truncate">{row.name}</div>
                    <div className="text-[11px] text-[#787671]">Sent: {row.sent} · Clicks: {row.clicks}</div>
                  </div>
                  <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-[4px] ${row.badge}`}>
                    {row.status}
                  </span>
                </div>
              ))}
            </div>

            <EmailPreview />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
