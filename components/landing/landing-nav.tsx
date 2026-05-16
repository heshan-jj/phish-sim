"use client";

import { useState, useEffect, type MouseEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Menu } from "lucide-react";
import { NavLogo3D } from "@/components/nav/nav-logo-3d";
import { NavLinkMotion } from "@/components/nav/nav-link-motion";
import { NavCta3D, NavLoginLink } from "@/components/nav/nav-cta-3d";
import { NavBarDecorations } from "@/components/nav/nav-bar-decorations";
import { cn } from "@/lib/utils";
import {
  springNav,
  springNavIsland,
  navStagger,
  navItem,
  navSheetItem,
  navSheetStagger,
} from "./motion-config";

const navLinks = [
  { label: "Product", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (mobileOpen) {
      root.classList.add("landing-menu-open");
      body.classList.add("landing-menu-open");
    } else {
      root.classList.remove("landing-menu-open");
      body.classList.remove("landing-menu-open");
    }
    return () => {
      root.classList.remove("landing-menu-open");
      body.classList.remove("landing-menu-open");
    };
  }, [mobileOpen]);

  const handleAnchor = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("#") && href.length > 1) {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogoClick = (event: MouseEvent) => {
    if (window.location.pathname === "/") {
      event.preventDefault();
      setMobileOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const linkVariant = scrolled ? "scrolled" : "hero";
  const ctaVariant = scrolled ? "solid" : "glass";
  return (
    <>
      <motion.header
        initial={prefersReduced ? false : { y: -100 }}
        animate={{ y: 0 }}
        transition={springNav}
        className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div
          className={cn(
            "w-full pointer-events-auto transition-[padding] duration-300 ease-out",
            scrolled ? "px-4 sm:px-6 lg:px-8 pt-3" : "px-0 pt-0",
          )}
        >
          <motion.div
            layout
            animate={
              scrolled
                ? {
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    boxShadow: "0 8px 32px rgba(10, 21, 48, 0.08)",
                    borderColor: "var(--ds-hairline)",
                  }
                : {
                    backgroundColor: "rgba(10, 10, 10, 0.35)",
                    boxShadow: "0 0 0 rgba(0,0,0,0)",
                    borderColor: "rgba(255, 255, 255, 0.12)",
                  }
            }
            transition={springNavIsland}
            className={cn(
              "relative overflow-hidden transition-[border-radius,width] duration-300 ease-out",
              scrolled
                ? "mx-auto w-full max-w-[1280px] rounded-[12px] border backdrop-blur-md"
                : "w-full rounded-none border-x-0 border-t-0 border-b landing-glass-nav",
            )}
          >
            <NavBarDecorations visible={!scrolled} />

            <motion.div
              className={cn(
                "relative flex items-center justify-between px-4",
                scrolled ? "h-14 sm:px-2" : "h-16 sm:px-6 lg:px-8",
              )}
              variants={prefersReduced ? undefined : navStagger}
              initial="initial"
              animate="animate"
            >
              <motion.div variants={prefersReduced ? undefined : navItem}>
                <NavLogo3D
                  variant="marketing"
                  marketingScrolled={scrolled}
                  href="/"
                  onClick={handleLogoClick}
                  showWordmark={false}
                />
              </motion.div>

              <motion.nav
                className="hidden lg:flex items-center gap-1"
                variants={prefersReduced ? undefined : navStagger}
              >
                {navLinks.map((link) => (
                  <motion.div key={link.label} variants={prefersReduced ? undefined : navItem}>
                    <NavLinkMotion
                      variant={linkVariant}
                      onClick={() => handleAnchor(link.href)}
                    >
                      {link.label}
                    </NavLinkMotion>
                  </motion.div>
                ))}
              </motion.nav>

              <motion.div
                className="hidden lg:flex items-center gap-2"
                variants={prefersReduced ? undefined : navItem}
              >
                <NavLoginLink href="/login" variant={linkVariant}>
                  Log in
                </NavLoginLink>
                <NavCta3D href="/signup" variant={ctaVariant}>
                  Start free
                </NavCta3D>
              </motion.div>

              <motion.div
                className="flex lg:hidden items-center gap-2"
                variants={prefersReduced ? undefined : navItem}
              >
                <NavCta3D href="/signup" compact variant={ctaVariant}>
                  Start free
                </NavCta3D>
                <motion.button
                  id="mobile-menu-toggle"
                  onClick={() => setMobileOpen(true)}
                  whileHover={prefersReduced ? undefined : { opacity: 0.85 }}
                  whileTap={prefersReduced ? undefined : { opacity: 0.7 }}
                  className={`p-2 rounded-[8px] min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors ${
                    scrolled
                      ? "text-[#37352f] hover:bg-[var(--ds-surface)]"
                      : "text-white hover:bg-white/10"
                  }`}
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
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
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-[min(85vw,320px)] flex flex-col overflow-hidden"
              style={{
                paddingBottom: "env(safe-area-inset-bottom)",
                background:
                  "linear-gradient(180deg, #e6e0f5 0%, #ffffff 120px, #ffffff 100%)",
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <motion.div
                className="flex items-center justify-between px-6 h-16 border-b border-[var(--ds-hairline)]"
                initial={prefersReduced ? false : { opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <NavLogo3D
                  variant="marketing"
                  marketingScrolled
                  href="/"
                  onClick={handleLogoClick}
                  showWordmark={false}
                />
                <motion.button
                  onClick={() => setMobileOpen(false)}
                  whileHover={prefersReduced ? undefined : { rotate: 90, scale: 1.05 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.95 }}
                  className="p-2 rounded-[8px] text-[#5d5b54] hover:bg-[var(--ds-surface)] min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </motion.div>

              <motion.nav
                className="flex-1 px-4 py-6 space-y-1 overflow-y-auto overscroll-contain"
                variants={prefersReduced ? undefined : navSheetStagger}
                initial="initial"
                animate="animate"
              >
                {navLinks.map((link) => (
                  <motion.div key={link.label} variants={prefersReduced ? undefined : navSheetItem}>
                    <NavLinkMotion
                      variant="sheet"
                      onClick={() => handleAnchor(link.href)}
                    >
                      {link.label}
                    </NavLinkMotion>
                  </motion.div>
                ))}
              </motion.nav>

              <motion.div
                className="px-4 py-6 border-t border-[var(--ds-hairline)] space-y-3"
                initial={prefersReduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <NavLoginLink
                  href="/login"
                  variant="sheet"
                  onClick={() => setMobileOpen(false)}
                >
                  Log in
                </NavLoginLink>
                <div className="w-full">
                  <NavCta3D
                    href="/signup"
                    className="w-full [&_a]:w-full [&_span]:w-full"
                    onClick={() => setMobileOpen(false)}
                  >
                    Start simulating free
                  </NavCta3D>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
