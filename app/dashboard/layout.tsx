import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { DashboardNavLoader } from "@/components/dashboard/dashboard-nav-loader";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--ds-surface)" }}
    >
      <Suspense fallback={<DashboardNav orgName="" />}>
        <DashboardNavLoader />
      </Suspense>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
