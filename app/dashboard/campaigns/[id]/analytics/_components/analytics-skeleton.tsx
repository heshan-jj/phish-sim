export function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <div className="h-7 w-56 rounded-[6px]" style={{ backgroundColor: "var(--ds-hairline)" }} />
        <div className="h-4 w-40 rounded-[6px]" style={{ backgroundColor: "var(--ds-hairline)" }} />
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[12px] border p-5 flex flex-col gap-3"
            style={{
              backgroundColor: "var(--ds-canvas)",
              borderColor: "var(--ds-hairline)",
            }}
          >
            <div className="h-3.5 w-24 rounded" style={{ backgroundColor: "var(--ds-hairline)" }} />
            <div className="h-8 w-16 rounded" style={{ backgroundColor: "var(--ds-hairline)" }} />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-[12px] border p-6"
            style={{
              backgroundColor: "var(--ds-canvas)",
              borderColor: "var(--ds-hairline)",
            }}
          >
            <div className="h-5 w-40 rounded mb-6" style={{ backgroundColor: "var(--ds-hairline)" }} />
            <div className="h-56 rounded-[8px]" style={{ backgroundColor: "var(--ds-surface)" }} />
          </div>
        ))}
      </div>

      {/* Employee table */}
      <div
        className="rounded-[12px] border"
        style={{
          backgroundColor: "var(--ds-canvas)",
          borderColor: "var(--ds-hairline)",
        }}
      >
        <div className="p-6 flex items-center justify-between border-b" style={{ borderColor: "var(--ds-hairline)" }}>
          <div className="h-5 w-36 rounded" style={{ backgroundColor: "var(--ds-hairline)" }} />
          <div className="flex gap-3">
            <div className="h-9 w-48 rounded-[8px]" style={{ backgroundColor: "var(--ds-hairline)" }} />
            <div className="h-9 w-36 rounded-[8px]" style={{ backgroundColor: "var(--ds-hairline)" }} />
          </div>
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 px-6 py-3.5 border-b last:border-b-0"
            style={{ borderColor: "var(--ds-hairline)" }}
          >
            <div className="h-4 w-36 rounded" style={{ backgroundColor: "var(--ds-hairline)" }} />
            <div className="h-4 w-24 rounded" style={{ backgroundColor: "var(--ds-hairline)" }} />
            <div className="h-4 w-28 rounded" style={{ backgroundColor: "var(--ds-hairline)" }} />
            <div className="h-5 w-20 rounded-[6px]" style={{ backgroundColor: "var(--ds-hairline)" }} />
            <div className="h-4 w-16 rounded" style={{ backgroundColor: "var(--ds-hairline)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
