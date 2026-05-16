import { cn } from "@/lib/utils";
import * as React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex w-full min-h-[100px] rounded-[8px] border px-3 py-2",
          "text-[16px] leading-[1.55] resize-none",
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
Textarea.displayName = "Textarea";

export { Textarea };
