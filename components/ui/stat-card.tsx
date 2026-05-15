"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  className?: string;
  color?: "default" | "coral" | "mint" | "amber" | "sky" | "lilac";
}

const colors = {
  default: { bg: "bg-[#f5f0e8]", border: "border-[#1a1a1a]", icon: "bg-white border-[#1a1a1a]" },
  coral:   { bg: "bg-[#ffe4e4]", border: "border-[#1a1a1a]", icon: "bg-[#ff6b6b] border-[#1a1a1a] text-white" },
  mint:    { bg: "bg-[#d4f5ec]", border: "border-[#1a1a1a]", icon: "bg-[#52c4a0] border-[#1a1a1a] text-white" },
  amber:   { bg: "bg-[#fff3d4]", border: "border-[#1a1a1a]", icon: "bg-[#ffb347] border-[#1a1a1a]" },
  sky:     { bg: "bg-[#ddeeff]", border: "border-[#1a1a1a]", icon: "bg-[#74b9ff] border-[#1a1a1a] text-white" },
  lilac:   { bg: "bg-[#ede9ff]", border: "border-[#1a1a1a]", icon: "bg-[#a29bfe] border-[#1a1a1a] text-white" },
};

export function StatCard({ title, value, icon, trend, className, color = "default" }: StatCardProps) {
  const c = colors[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("border-2 rounded-2xl p-4 flex flex-col gap-3", c.bg, c.border, className)}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#6b6560] uppercase tracking-wide">{title}</span>
        <div className={cn("p-2 border-2 rounded-xl", c.icon)}>
          {icon}
        </div>
      </div>
      <div>
        <span className="text-2xl font-black text-[#1a1a1a] tracking-tight">{value}</span>
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-xs font-semibold">
          {trend.value >= 0
            ? <TrendingUp size={11} className="text-[#52c4a0]" />
            : <TrendingDown size={11} className="text-[#ff6b6b]" />}
          <span className={trend.value >= 0 ? "text-[#1a7a5e]" : "text-[#cc2b2b]"}>
            {trend.value >= 0 ? "+" : ""}{trend.value}%
          </span>
          <span className="text-[#a8a29e] font-normal">{trend.label}</span>
        </div>
      )}
    </motion.div>
  );
}
