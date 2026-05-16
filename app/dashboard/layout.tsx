import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { createServerClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

async function getCurrentOrg() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.userId, user.id))
    .limit(1);

  return org ?? null;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const org = await getCurrentOrg();

  if (!org) {
    redirect("/onboarding");
  }

  if (!org.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
