import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { getOrgForUser } from "@/lib/org";
import { redirect } from "next/navigation";

export async function DashboardNavLoader() {
  const org = await getOrgForUser();

  if (!org) {
    redirect("/onboarding");
  }

  if (!org.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  return <DashboardNav orgName={org.name} />;
}
