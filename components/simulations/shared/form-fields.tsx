import { cn } from "@/lib/utils";

export function VisuallyHiddenLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="sr-only">
      {children}
    </label>
  );
}

export function SimulationInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  className,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className="w-full">
      <VisuallyHiddenLabel htmlFor={id}>{label}</VisuallyHiddenLabel>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className={cn(
          "h-11 w-full rounded border border-[#c7c7c7] bg-white px-3 text-sm text-[#1b1b1b] outline-none transition focus:border-[#005fb8] focus:shadow-[0_0_0_1px_#005fb8]",
          className,
        )}
      />
    </div>
  );
}

export function InactiveLink({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn("text-sm font-medium hover:underline", className)}
      onClick={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
}

export function SubmitButton({
  children,
  disabled,
  className,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={cn(
        "h-11 w-full rounded text-sm font-semibold text-white transition disabled:opacity-70",
        className,
      )}
    >
      {children}
    </button>
  );
}
