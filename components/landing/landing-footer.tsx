"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { useState } from "react";
import { landingContainer } from "./landing-layout";

const footerLinks = {
  Product: [
    { label: "Campaign builder", href: "#features" },
    { label: "Employee roster", href: "#features" },
    { label: "Analytics", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
  ],
  Docs: [
    { label: "Getting started", href: "#" },
    { label: "API reference", href: "#" },
    { label: "CSV import guide", href: "#" },
  ],
  Legal: [
    { label: "Privacy policy", href: "#" },
    { label: "Terms of service", href: "#" },
    { label: "Cookie policy", href: "#" },
  ],
};

function FooterAccordionGroup({
  title,
  links,
  open,
  onToggle,
}: {
  title: string;
  links: { label: string; href: string }[];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-[var(--ds-hairline,#e5e3df)] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full min-h-[44px] items-center justify-between rounded-[8px] py-3 text-left transition-colors hover:bg-[var(--ds-surface)]"
        aria-expanded={open}
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--ds-steel,#a4a097)]">
          {title}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-[var(--ds-steel,#787671)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="space-y-1 pb-4">
          {links.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="flex items-center py-2 text-sm text-[var(--ds-steel,#787671)] hover:text-[var(--ds-ink,#1a1a1a)] transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function LandingFooter() {
  const [openGroup, setOpenGroup] = useState<string | null>("Product");

  return (
    <footer
      className="border-t border-[var(--ds-hairline,#e5e3df)] bg-white"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className={`${landingContainer} py-12 md:py-16`}>
        <div className="flex flex-col gap-10 md:flex-row md:justify-between md:gap-12">
          <div className="shrink-0 md:max-w-[340px]">
            <Link href="/" className="inline-block mb-4">
              <BrandLogo variant="full" className="h-28 w-auto max-w-[420px]" />
            </Link>
          </div>

          <div className="md:hidden w-full">
            {Object.entries(footerLinks).map(([group, links]) => (
              <FooterAccordionGroup
                key={group}
                title={group}
                links={links}
                open={openGroup === group}
                onToggle={() => setOpenGroup((g) => (g === group ? null : group))}
              />
            ))}
          </div>

          <div className="hidden md:flex flex-row gap-12">
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <div className="text-xs font-semibold text-[var(--ds-steel,#a4a097)] uppercase tracking-wide mb-3">
                  {group}
                </div>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-[var(--ds-steel,#787671)] hover:text-[var(--ds-ink,#1a1a1a)] transition-colors py-1 inline-flex"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-[var(--ds-hairline,#e5e3df)] flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
          <p className="text-xs text-[var(--ds-steel,#a4a097)]">
            © {new Date().getFullYear()} PhishSim. All rights reserved.
          </p>
          <p className="text-xs text-[var(--ds-steel,#a4a097)]">
            Built for security teams who care.
          </p>
        </div>
      </div>
    </footer>
  );
}
