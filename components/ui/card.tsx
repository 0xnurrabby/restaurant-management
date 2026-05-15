import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  accent?: "coral" | "mint" | "amber" | "sky" | "lilac" | "none";
}

const accents = {
  coral:  "border-l-4 border-l-[#ff6b6b]",
  mint:   "border-l-4 border-l-[#52c4a0]",
  amber:  "border-l-4 border-l-[#ffb347]",
  sky:    "border-l-4 border-l-[#74b9ff]",
  lilac:  "border-l-4 border-l-[#a29bfe]",
  none:   "",
};

export function Card({ className, children, onClick, accent = "none" }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white border-2 border-[#1a1a1a] rounded-2xl p-4",
        accents[accent],
        onClick && "cursor-pointer transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h3 className={cn("text-sm font-bold text-[#1a1a1a] tracking-tight", className)}>
      {children}
    </h3>
  );
}
