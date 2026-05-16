import { Card } from "@/components/ui/card";

export function LeaderboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div>
        <div className="h-4 w-32 rounded bg-[var(--ds-hairline)] mb-6" />
        <div className="h-8 w-96 max-w-full rounded bg-[var(--ds-hairline)] mb-2" />
        <div className="h-4 w-64 rounded bg-[var(--ds-hairline)]" />
      </div>
      <Card className="h-20" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-44" />
        ))}
      </div>
    </div>
  );
}
