import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full bg-white border-2 border-[#1a1a1a] rounded-xl px-3 py-2.5 text-sm text-[#1a1a1a] outline-none",
              "transition-colors duration-150",
              "focus:border-[#ff6b6b] placeholder:text-[#c4bdb4]",
              icon && "pl-9",
              error && "border-[#ff6b6b]",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[#ff6b6b] text-xs font-medium mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
