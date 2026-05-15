"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "coral" | "mint" | "amber";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary:   "bg-[#1a1a1a] text-white border-2 border-[#1a1a1a] hover:bg-[#333]",
      secondary: "bg-[#f5f0e8] text-[#1a1a1a] border-2 border-[#1a1a1a] hover:bg-[#ebe5d8]",
      ghost:     "bg-transparent text-[#1a1a1a] border-2 border-transparent hover:bg-[#f5f0e8]",
      danger:    "bg-[#ff6b6b] text-white border-2 border-[#ff6b6b] hover:bg-[#ff5252]",
      outline:   "bg-white text-[#1a1a1a] border-2 border-[#1a1a1a] hover:bg-[#f5f0e8]",
      coral:     "bg-[#ff6b6b] text-white border-2 border-[#1a1a1a] hover:bg-[#ff5252]",
      mint:      "bg-[#52c4a0] text-white border-2 border-[#1a1a1a] hover:bg-[#3db389]",
      amber:     "bg-[#ffb347] text-[#1a1a1a] border-2 border-[#1a1a1a] hover:bg-[#ffa020]",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs font-semibold rounded-xl gap-1.5",
      md: "px-4 py-2.5 text-sm font-semibold rounded-xl gap-2",
      lg: "px-6 py-3 text-sm font-bold rounded-2xl gap-2",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.1 }}
        className={cn(
          "inline-flex items-center justify-center cursor-pointer select-none transition-colors duration-150",
          variants[variant],
          sizes[size],
          (disabled || loading) && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        disabled={disabled || loading}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export { Button };
