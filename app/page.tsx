import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { createServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "PhishSim — Phishing simulations your team will actually learn from",
  description:
    "Launch realistic phishing campaigns, track opens and clicks, and build security awareness—all in one workspace.",
};

export default async function Home() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <LandingPage isAuthenticated={!!user} />;
}
