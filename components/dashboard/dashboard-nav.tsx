"use client";

import { createBrowserClient } from "@/lib/supabase";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { NavLogo3D } from "@/components/nav/nav-logo-3d";
import { NavLinkMotion } from "@/components/nav/nav-link-motion";
import { springNav, navItem, navStagger } from "@/components/landing/motion-config";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/employees", label: "Employees", exact: false },
  { href: "/dashboard/campaigns", label: "Campaigns", exact: false },
  { href: "/dashboard/nasiko/logs", label: "Nasiko logs", exact: false },
] as const;

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav({ orgName }: { orgName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const prefersReduced = useReducedMotion();

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <motion.header
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={springNav}
      className="sticky top-0 z-40 border-b"
      style={{
        backgroundColor: "var(--ds-canvas)",
        borderColor: "var(--ds-hairline)",
        boxShadow: "0 1px 0 rgba(10, 21, 48, 0.04)",
      }}
    >
      <motion.div
        className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6"
        variants={prefersReduced ? undefined : navStagger}
        initial={false}
        animate="animate"
      >
        <motion.div variants={prefersReduced ? undefined : navItem} className="flex shrink-0 items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0 group">
          <NavLogo3D variant="app" linkless showWordmark={false} />
          <span
            className="text-[13px] font-[500] leading-tight truncate max-w-[140px] sm:max-w-[220px] min-w-0"
            style={{ color: "var(--ds-steel)" }}
            title={orgName}
          >
            {orgName}
          </span>
          </Link>
        </motion.div>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <NavLinkMotion
                key={item.href}
                href={item.href}
                variant="app"
                active={active}
                layoutId="dashboard-active-pill"
              >
                {item.label}
              </NavLinkMotion>
            );
          })}
        </nav>

        <motion.button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={signingOut}
          variants={prefersReduced ? undefined : navItem}
          whileHover={
            prefersReduced || signingOut
              ? undefined
              : { y: -2, boxShadow: "0 4px 12px rgba(10, 21, 48, 0.08)" }
          }
          whileTap={prefersReduced || signingOut ? undefined : { scale: 0.98 }}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-[8px] border border-ds-hairline-strong bg-ds-canvas px-3 py-2 text-[13px] font-[500] text-ds-charcoal transition-colors hover:bg-ds-surface active:bg-ds-surface disabled:opacity-50"
        >
          <LogOut
            className={`size-4 transition-transform ${!prefersReduced && !signingOut ? "group-hover:translate-x-0.5" : ""}`}
          />
          <span className="hidden sm:inline">
            {signingOut ? "Signing out…" : "Sign out"}
          </span>
        </motion.button>
      </motion.div>
    </motion.header>
  );
}
