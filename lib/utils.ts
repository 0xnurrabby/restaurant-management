import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  // BDT — Bangladeshi Taka
  return "৳" + new Intl.NumberFormat("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(amount));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
