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
      <div className="mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/textlogo.svg"
          alt="PhishSim"
          className="h-16 w-auto"
        />
      </div>

      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}
