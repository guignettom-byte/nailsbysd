"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-body font-medium tracking-widest uppercase text-xs transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-[#78716c] text-white hover:bg-[#2a2018]": variant === "primary",
            "border border-[#78716c] text-[#78716c] hover:bg-[#78716c] hover:text-white": variant === "outline",
            "text-[#78716c] hover:text-[#2a2018]": variant === "ghost",
            "bg-red-500 text-white hover:bg-red-700": variant === "danger",
          },
          {
            "px-4 py-2 text-xs": size === "sm",
            "px-6 py-3": size === "md",
            "px-8 py-4 text-sm": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
