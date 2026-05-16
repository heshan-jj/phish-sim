"use client";

import { LandingNav } from "./landing-nav";
import { HeroSection } from "./hero-section";
import { SocialProofStrip } from "./social-proof-strip";
import { FeatureGrid } from "./feature-grid";
import { HowItWorks } from "./how-it-works";
import { StatsBand } from "./stats-band";
import { PricingSection } from "./pricing-section";
import { FAQSection } from "./faq-section";
import { FinalCTA } from "./final-cta";
import { LandingFooter } from "./landing-footer";
import type { LandingAuthProps } from "./types";

export function LandingPage({ isAuthenticated }: LandingAuthProps) {
  return (
    <div>
      <LandingNav isAuthenticated={isAuthenticated} />
      <main>
        <HeroSection isAuthenticated={isAuthenticated} />
        <SocialProofStrip />
        <FeatureGrid />
        <HowItWorks />
        <StatsBand />
        <PricingSection isAuthenticated={isAuthenticated} />
        <FAQSection isAuthenticated={isAuthenticated} />
        <FinalCTA isAuthenticated={isAuthenticated} />
      </main>
      <LandingFooter />
    </div>
  );
}
