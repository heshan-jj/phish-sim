interface FormErrorProps {
  children: React.ReactNode;
  className?: string;
}

export function FormError({ children, className }: FormErrorProps) {
  if (!children) return null;

  return (
    <p
      role="alert"
      className={`text-[13px] leading-[1.40] ${className ?? ""}`}
      style={{ color: "var(--ds-error)" }}
    >
      {children}
    </p>
  );
}
