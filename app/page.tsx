import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "PhishSim — Phishing simulations your team will actually learn from",
  description:
    "Launch realistic phishing campaigns, track opens and clicks, and build security awareness—all in one workspace.",
};

export default function Home() {
  return <LandingPage />;
}
