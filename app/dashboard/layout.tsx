import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getOrgForUser } from "@/lib/org";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const org = await getOrgForUser();

  if (!org) {
    redirect("/onboarding");
  }

  if (!org.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  return <DashboardShell orgName={org.name}>{children}</DashboardShell>;
}
