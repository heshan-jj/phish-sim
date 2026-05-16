export default function NewCampaignLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full animate-pulse">
      <div>
        <div
          className="h-8 w-48 rounded-[6px] mb-2"
          style={{ backgroundColor: "var(--ds-hairline)" }}
        />
        <div
          className="h-4 w-72 max-w-full rounded-[6px] mb-6"
          style={{ backgroundColor: "var(--ds-hairline)" }}
        />
        <div className="flex items-center justify-center gap-0 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: "var(--ds-hairline)" }}
              />
              {i < 3 && (
                <div className="w-16 h-px" style={{ backgroundColor: "var(--ds-hairline)" }} />
              )}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 rounded-[12px] border"
              style={{
                borderColor: "var(--ds-hairline)",
                backgroundColor: "var(--ds-canvas)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
