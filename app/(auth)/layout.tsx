export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: "var(--ds-surface)" }}
    >
      {/* Wordmark */}
      <div className="mb-8 flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-[8px] flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: "var(--ds-primary)" }}
        >
          P
        </div>
        <span
          className="text-[15px] font-semibold tracking-tight"
          style={{ color: "var(--ds-ink)" }}
        >
          PhishSim
        </span>
      </div>

      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}
