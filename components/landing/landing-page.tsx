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

export function LandingPage() {
  return (
    <div>
      <LandingNav />
      <main>
        <HeroSection />
        <SocialProofStrip />
        <FeatureGrid />
        <HowItWorks />
        <StatsBand />
        <PricingSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
