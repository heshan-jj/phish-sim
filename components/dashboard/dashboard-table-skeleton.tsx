export function DashboardTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="rounded-[12px] border overflow-hidden animate-pulse"
      style={{
        backgroundColor: "var(--ds-canvas)",
        borderColor: "var(--ds-hairline)",
      }}
    >
      <div
        className="flex gap-4 border-b px-4 py-3"
        style={{ borderColor: "var(--ds-hairline)" }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-4 flex-1 max-w-[120px] rounded-[6px]"
            style={{ backgroundColor: "var(--ds-surface)" }}
          />
        ))}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          className="flex gap-4 border-b px-4 py-4 last:border-b-0"
          style={{ borderColor: "var(--ds-hairline)" }}
        >
          {[1, 2, 3, 4].map((col) => (
            <div
              key={col}
              className="h-4 flex-1 rounded-[6px]"
              style={{ backgroundColor: "var(--ds-surface)" }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
