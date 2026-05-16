import { cn } from "@/lib/utils";
import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full h-11 rounded-[8px] border px-3 py-2 text-[16px] leading-[1.55]",
          "bg-[var(--ds-canvas)] text-[var(--ds-ink)]",
          "border-[var(--ds-hairline-strong)]",
          "placeholder:text-[var(--ds-muted)]",
          "focus:outline-none focus:border-[2px] focus:border-[var(--ds-primary)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-colors",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
