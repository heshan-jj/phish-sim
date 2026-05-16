import { Card } from "@/components/ui/card";
import { DashboardTableSkeleton } from "@/components/dashboard/dashboard-table-skeleton";

const CARD_TRACK_CLASS =
  "flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none lg:grid-cols-3";

function RecommendationSkeletonCard() {
  return (
    <div
      className="flex min-w-[min(100%,320px)] shrink-0 snap-start flex-col overflow-hidden rounded-[12px] sm:min-w-0"
      style={{
        backgroundColor: "var(--ds-canvas)",
        boxShadow: "0 1px 2px rgba(15, 15, 15, 0.04)",
      }}
    >
      <div className="h-1 w-full" style={{ backgroundColor: "var(--ds-lavender)" }} />
      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div
            className="size-10 shrink-0 rounded-[10px]"
            style={{ backgroundColor: "var(--ds-surface)" }}
          />
          <div className="flex-1 space-y-2">
            <div
              className="h-4 w-12 rounded-full"
              style={{ backgroundColor: "var(--ds-surface)" }}
            />
            <div
              className="h-5 w-3/4 rounded-[6px]"
              style={{ backgroundColor: "var(--ds-surface)" }}
            />
          </div>
        </div>
        <div
          className="h-20 rounded-[8px]"
          style={{ backgroundColor: "var(--ds-surface)" }}
        />
        <div
          className="h-10 w-full rounded-[8px]"
          style={{ backgroundColor: "var(--ds-surface)" }}
        />
      </div>
    </div>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div
        className="h-4 w-full max-w-md rounded-[6px] -mt-6"
        style={{ backgroundColor: "var(--ds-surface)" }}
      />

      <section
        className="overflow-hidden rounded-[16px] border"
        style={{ borderColor: "var(--ds-hairline)" }}
      >
        <div
          className="border-b px-4 py-5 sm:px-6"
          style={{
            borderColor: "var(--ds-hairline)",
            background:
              "linear-gradient(135deg, var(--ds-lavender) 0%, var(--ds-canvas) 55%, var(--ds-surface-soft) 100%)",
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <div className="space-y-2">
              <div
                className="h-6 w-28 rounded-full"
                style={{ backgroundColor: "var(--ds-surface)" }}
              />
              <div
                className="h-6 w-56 max-w-full rounded-[6px]"
                style={{ backgroundColor: "var(--ds-surface)" }}
              />
              <div
                className="h-4 w-72 max-w-full rounded-[6px]"
                style={{ backgroundColor: "var(--ds-surface)" }}
              />
            </div>
            <div
              className="h-9 w-28 shrink-0 rounded-[8px]"
              style={{ backgroundColor: "var(--ds-surface)" }}
            />
          </div>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <div className={CARD_TRACK_CLASS}>
            {[1, 2, 3].map((i) => (
              <RecommendationSkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div
              className="h-4 w-24 rounded-[6px] mb-3"
              style={{ backgroundColor: "var(--ds-surface)" }}
            />
            <div
              className="h-8 w-16 rounded-[6px]"
              style={{ backgroundColor: "var(--ds-surface)" }}
            />
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="p-6 min-h-[180px]">
            <div
              className="h-5 w-40 rounded-[6px] mb-2"
              style={{ backgroundColor: "var(--ds-surface)" }}
            />
            <div
              className="h-4 w-full max-w-xs rounded-[6px] mb-6"
              style={{ backgroundColor: "var(--ds-surface)" }}
            />
            <div
              className="h-11 w-full rounded-[8px]"
              style={{ backgroundColor: "var(--ds-surface)" }}
            />
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 pb-4">
          <div
            className="h-5 w-36 rounded-[6px] mb-2"
            style={{ backgroundColor: "var(--ds-surface)" }}
          />
          <div
            className="h-4 w-56 rounded-[6px]"
            style={{ backgroundColor: "var(--ds-surface)" }}
          />
        </div>
        <DashboardTableSkeleton rows={4} />
      </Card>
    </div>
  );
}


