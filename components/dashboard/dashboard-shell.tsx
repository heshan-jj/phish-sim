import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export function DashboardShell({
  orgName,
  children,
}: {
  orgName: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--ds-surface)" }}
    >
      <DashboardNav orgName={orgName} />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
