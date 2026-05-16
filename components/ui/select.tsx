import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import * as React from "react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex w-full h-11 appearance-none rounded-[8px] border px-3 py-2 pr-9",
            "text-[16px] leading-[1.55]",
            "bg-[var(--ds-canvas)] text-[var(--ds-ink)]",
            "border-[var(--ds-hairline-strong)]",
            "focus:outline-none focus:border-[2px] focus:border-[var(--ds-primary)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors cursor-pointer",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--ds-steel)]"
          size={16}
        />
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
