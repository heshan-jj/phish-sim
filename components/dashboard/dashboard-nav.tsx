"use client";

import { createBrowserClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/employees", label: "Employees", exact: false },
  { href: "/dashboard/campaigns", label: "Campaigns", exact: false },
] as const;

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav({ orgName }: { orgName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        backgroundColor: "var(--ds-canvas)",
        borderColor: "var(--ds-hairline)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/notextlogo.svg"
            alt="PhishSim"
            className="h-8 w-8 shrink-0"
          />
          <div className="flex flex-col">
            <span
              className="text-[15px] font-[600] leading-tight"
              style={{ color: "var(--ds-ink)" }}
            >
              PhishSim
            </span>
            <span
              className="text-[12px] leading-tight truncate max-w-[140px] sm:max-w-[200px]"
              style={{ color: "var(--ds-steel)" }}
              title={orgName}
            >
              {orgName}
            </span>
          </div>
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-[8px] px-3 py-2 text-[14px] font-[500] whitespace-nowrap transition-colors",
                  active
                    ? "text-[var(--ds-ink)]"
                    : "text-[var(--ds-steel)]",
                )}
                style={
                  active
                    ? { backgroundColor: "var(--ds-surface)" }
                    : undefined
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={signingOut}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-[8px] border px-3 py-2 text-[13px] font-[500] transition-colors disabled:opacity-50"
          style={{
            borderColor: "var(--ds-hairline-strong)",
            color: "var(--ds-charcoal)",
          }}
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">
            {signingOut ? "Signing out…" : "Sign out"}
          </span>
        </button>
      </div>
    </header>
  );
}
