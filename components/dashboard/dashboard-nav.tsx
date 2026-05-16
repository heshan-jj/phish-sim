"use client";

import { createBrowserClient } from "@/lib/supabase";
import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { NavLogo3D } from "@/components/nav/nav-logo-3d";
import { NavLinkMotion } from "@/components/nav/nav-link-motion";
import {
  springNav,
  navItem,
  navStagger,
  navSheetItem,
  navSheetStagger,
} from "@/components/landing/motion-config";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/employees", label: "Employees", exact: false },
  { href: "/dashboard/campaigns", label: "Campaigns", exact: false },
  {
    href: "/dashboard/nasiko/logs",
    label: "Nasiko platform logs",
    shortLabel: "Nasiko logs",
    exact: false,
  },
] as const;

const DRAWER_ID = "dashboard-mobile-nav";

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav({ orgName }: { orgName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const prefersReduced = useReducedMotion();

  const activeItemLabel = useMemo(() => {
    const item = NAV_ITEMS.find((nav) => isActive(pathname, nav.href, nav.exact));
    if (!item) return null;
    return "shortLabel" in item && item.shortLabel ? item.shortLabel : item.label;
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (mobileOpen) {
      root.classList.add("dashboard-menu-open");
      body.classList.add("dashboard-menu-open");
    } else {
      root.classList.remove("dashboard-menu-open");
      body.classList.remove("dashboard-menu-open");
    }
    return () => {
      root.classList.remove("dashboard-menu-open");
      body.classList.remove("dashboard-menu-open");
    };
  }, [mobileOpen]);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <motion.header
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={springNav}
        className="sticky top-0 z-40 border-b"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          backgroundColor: "var(--ds-canvas)",
          borderColor: "var(--ds-hairline)",
          boxShadow: "0 1px 0 rgba(10, 21, 48, 0.04)",
        }}
      >
        <motion.div
          className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6 lg:gap-6"
          variants={prefersReduced ? undefined : navStagger}
          initial={false}
          animate="animate"
        >
          <motion.div
            variants={prefersReduced ? undefined : navItem}
            className="flex min-w-0 shrink-0 items-center gap-2"
          >
            <Link href="/dashboard" className="group flex min-w-0 items-center gap-2">
              <NavLogo3D variant="app" linkless showWordmark={false} />
              <div className="flex min-w-0 flex-col">
                <span
                  className="truncate text-[13px] font-[500] leading-tight max-w-[120px] sm:max-w-[180px] lg:max-w-[220px]"
                  style={{ color: "var(--ds-steel)" }}
                  title={orgName}
                >
                  {orgName}
                </span>
                {activeItemLabel && (
                  <span
                    className="truncate text-[12px] leading-tight lg:hidden"
                    style={{ color: "var(--ds-stone)" }}
                  >
                    {activeItemLabel}
                  </span>
                )}
              </div>
            </Link>
          </motion.div>

          <nav className="hidden flex-1 items-center gap-1 lg:flex">
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
            aria-label="Sign out"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
            variants={prefersReduced ? undefined : navItem}
            whileHover={
              prefersReduced || signingOut
                ? undefined
                : { y: -2, boxShadow: "0 4px 12px rgba(10, 21, 48, 0.08)" }
            }
            whileTap={prefersReduced || signingOut ? undefined : { scale: 0.98 }}
            className="group hidden shrink-0 items-center gap-1.5 rounded-[8px] border border-ds-hairline-strong bg-ds-canvas px-3 py-2 text-[13px] font-[500] text-ds-charcoal transition-colors hover:bg-ds-surface active:bg-ds-surface disabled:opacity-50 lg:inline-flex"
          >
            <LogOut
              className={`size-4 transition-transform ${!prefersReduced && !signingOut ? "group-hover:translate-x-0.5" : ""}`}
            />
            <span>{signingOut ? "Signing out…" : "Sign out"}</span>
          </motion.button>

          <motion.button
            type="button"
            id="dashboard-mobile-menu-toggle"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls={DRAWER_ID}
            onClick={() => setMobileOpen(true)}
            variants={prefersReduced ? undefined : navItem}
            whileHover={prefersReduced ? undefined : { opacity: 0.85 }}
            whileTap={prefersReduced ? undefined : { scale: 0.98 }}
            className="ml-auto flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-[8px] p-2 text-ds-charcoal transition-colors hover:bg-ds-surface lg:hidden"
          >
            <Menu className="size-5" />
          </motion.button>
        </motion.div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <motion.div
              id={DRAWER_ID}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 z-[70] flex w-[min(85vw,320px)] flex-col overflow-hidden"
              style={{
                paddingTop: "env(safe-area-inset-top)",
                paddingBottom: "env(safe-area-inset-bottom)",
                backgroundColor: "var(--ds-canvas)",
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Dashboard navigation"
            >
              <div
                className="flex h-16 shrink-0 items-center justify-between border-b px-4"
                style={{ borderColor: "var(--ds-hairline)" }}
              >
                <Link
                  href="/dashboard"
                  className="flex min-w-0 items-center gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <NavLogo3D variant="app" linkless showWordmark={false} />
                  <span
                    className="truncate text-[13px] font-[500]"
                    style={{ color: "var(--ds-steel)" }}
                    title={orgName}
                  >
                    {orgName}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[8px] p-2 transition-colors hover:bg-ds-surface"
                  style={{ color: "var(--ds-steel)" }}
                  aria-label="Close navigation menu"
                >
                  <X className="size-5" />
                </button>
              </div>

              <motion.nav
                className="flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-4"
                variants={prefersReduced ? undefined : navSheetStagger}
                initial="initial"
                animate="animate"
              >
                {NAV_ITEMS.map((item) => {
                  const active = isActive(pathname, item.href, item.exact);
                  const displayLabel =
                    "shortLabel" in item && item.shortLabel ? item.shortLabel : item.label;
                  return (
                    <motion.div
                      key={item.href}
                      variants={prefersReduced ? undefined : navSheetItem}
                    >
                      <NavLinkMotion
                        href={item.href}
                        variant="appSheet"
                        active={active}
                        onClick={() => setMobileOpen(false)}
                      >
                        {displayLabel}
                      </NavLinkMotion>
                    </motion.div>
                  );
                })}
              </motion.nav>

              <motion.div
                className="shrink-0 border-t px-4 py-4"
                style={{ borderColor: "var(--ds-hairline)" }}
                initial={prefersReduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  disabled={signingOut}
                  className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-[8px] border border-ds-hairline-strong bg-ds-canvas px-4 py-2.5 text-[14px] font-[500] text-ds-charcoal transition-colors hover:bg-ds-surface active:bg-ds-surface disabled:opacity-50"
                >
                  <LogOut className="size-4" />
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
