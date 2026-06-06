import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-xs font-medium tracking-widest uppercase text-[#2a2018]/60">
            {label}
          </label>
        )}
        <textarea
          id={id}
          ref={ref}
          rows={3}
          className={cn(
            "w-full border-b border-[#2a2018]/20 bg-transparent px-0 py-2 text-[#2a2018] placeholder:text-[#2a2018]/30 focus:outline-none focus:border-[#78716c] transition-colors resize-none",
            error && "border-red-400",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export { Textarea };
