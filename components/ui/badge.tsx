import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline" | "coral" | "mint" | "amber";
  className?: string;
}

const variants = {
  default: "bg-[#f5f0e8] text-[#6b6560] border-[#d4cdc3]",
  success: "bg-[#d4f5ec] text-[#1a7a5e] border-[#52c4a0]",
  warning: "bg-[#fff3d4] text-[#8a6200] border-[#ffb347]",
  danger:  "bg-[#ffe4e4] text-[#cc2b2b] border-[#ff6b6b]",
  info:    "bg-[#ddeeff] text-[#1a5fa8] border-[#74b9ff]",
  outline: "bg-white text-[#1a1a1a] border-[#1a1a1a]",
  coral:   "bg-[#ffe4e4] text-[#cc2b2b] border-[#ff6b6b]",
  mint:    "bg-[#d4f5ec] text-[#1a7a5e] border-[#52c4a0]",
  amber:   "bg-[#fff3d4] text-[#8a6200] border-[#ffb347]",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold border",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
