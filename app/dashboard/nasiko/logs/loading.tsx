import { Card } from "@/components/ui/card";
import { DashboardTableSkeleton } from "@/components/dashboard/dashboard-table-skeleton";

export default function NasikoLogsLoading() {
  return (
    <Card className="overflow-hidden">
      <DashboardTableSkeleton rows={8} />
    </Card>
  );
}
