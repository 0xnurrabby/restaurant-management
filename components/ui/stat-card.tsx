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
  color?: "default" | "green" | "amber" | "red" | "blue";
}

const colors = {
  default: "bg-white border-stone-200",
  green: "bg-green-50 border-green-200",
  amber: "bg-amber-50 border-amber-200",
  red: "bg-red-50 border-red-200",
  blue: "bg-blue-50 border-blue-200",
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  className,
  color = "default",
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "border-2 rounded-2xl p-4 flex flex-col gap-3",
        colors[color],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-stone-600 font-medium">{title}</span>
        <div className="p-2 bg-white border-2 border-stone-200 rounded-xl text-stone-700">
          {icon}
        </div>
      </div>
      <div>
        <span className="text-2xl font-bold text-black">{value}</span>
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-xs">
          {trend.value >= 0 ? (
            <TrendingUp size={12} className="text-green-600" />
          ) : (
            <TrendingDown size={12} className="text-red-600" />
          )}
          <span
            className={
              trend.value >= 0 ? "text-green-600" : "text-red-600"
            }
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </span>
          <span className="text-stone-500">{trend.label}</span>
        </div>
      )}
    </motion.div>
  );
}
