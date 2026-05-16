import { BrandLogo } from "@/components/brand/brand-logo";

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
      <div className="mb-8">
        <BrandLogo variant="full" className="h-16 w-auto" priority />
      </div>

      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}
