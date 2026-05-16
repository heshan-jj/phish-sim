import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { createServerClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function PostLoginPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.userId, user.id))
    .limit(1);

  if (!org?.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}
