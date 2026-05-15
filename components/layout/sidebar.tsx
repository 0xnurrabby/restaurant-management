"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingCart, UtensilsCrossed, Grid3X3,
  Package, Users, BarChart3, Bell, Settings, ChefHat,
  LogOut, Menu, X, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { Session } from "@/lib/types";

interface SidebarProps {
  session: Session;
  restaurantName?: string;
}

const allNavItems = [
  { href: "/admin",               label: "Dashboard",    icon: LayoutDashboard,  permission: null,        color: "text-[#1a1a1a]",  activeBg: "bg-[#1a1a1a]" },
  { href: "/admin/pos",           label: "POS",          icon: ShoppingCart,     permission: "pos",       color: "text-[#ff6b6b]",  activeBg: "bg-[#ff6b6b]" },
  { href: "/admin/orders",        label: "Orders",       icon: UtensilsCrossed,  permission: null,        color: "text-[#ffb347]",  activeBg: "bg-[#ffb347]" },
  { href: "/admin/tables",        label: "Tables",       icon: Grid3X3,          permission: "tables",    color: "text-[#74b9ff]",  activeBg: "bg-[#74b9ff]" },
  { href: "/admin/kds",           label: "Kitchen",      icon: ChefHat,          permission: "kds",       color: "text-[#52c4a0]",  activeBg: "bg-[#52c4a0]" },
  { href: "/admin/menu",          label: "Menu",         icon: Layers,           permission: "menu",      color: "text-[#a29bfe]",  activeBg: "bg-[#a29bfe]" },
  { href: "/admin/inventory",     label: "Inventory",    icon: Package,          permission: "inventory", color: "text-[#fd79a8]",  activeBg: "bg-[#fd79a8]" },
  { href: "/admin/staff",         label: "Staff",        icon: Users,            permission: "staff",     color: "text-[#1a1a1a]",  activeBg: "bg-[#1a1a1a]" },
  { href: "/admin/reports",       label: "Reports",      icon: BarChart3,        permission: "reports",   color: "text-[#ffb347]",  activeBg: "bg-[#ffb347]" },
  { href: "/admin/notifications", label: "Alerts",       icon: Bell,             permission: null,        color: "text-[#ff6b6b]",  activeBg: "bg-[#ff6b6b]" },
  { href: "/admin/settings",      label: "Settings",     icon: Settings,         permission: "settings",  color: "text-[#6b6560]",  activeBg: "bg-[#6b6560]" },
];

export function Sidebar({ session, restaurantName = "Zunayed" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = allNavItems.filter((item) => {
    if (!item.permission) return true;
    if (session.role === "main_admin" || session.role === "admin") return true;
    return session.permissions.includes(item.permission as never);
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const NavContent = () => (
    <div className="flex flex-col h-full bg-[#faf9f7]">
      {/* Logo */}
      <div className="p-4 border-b-2 border-[#1a1a1a]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#ff6b6b] border-2 border-[#1a1a1a] rounded-xl flex items-center justify-center shrink-0">
            <ChefHat size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-black text-sm text-[#1a1a1a] truncate leading-none">{restaurantName}</p>
            <p className="text-[10px] text-[#a8a29e] font-semibold uppercase tracking-wide mt-0.5 capitalize">
              {session.role.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 border-2",
                isActive
                  ? `${item.activeBg} text-white border-[#1a1a1a]`
                  : "text-[#6b6560] border-transparent hover:bg-white hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
              )}
            >
              <item.icon size={15} className={isActive ? "text-white" : item.color} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t-2 border-[#1a1a1a]">
        <div className="flex items-center gap-2 px-3 py-2 mb-1 bg-white border-2 border-[#e8e4de] rounded-xl">
          <div className="w-7 h-7 bg-[#ff6b6b] border-2 border-[#1a1a1a] rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0">
            {session.email[0].toUpperCase()}
          </div>
          <p className="text-xs font-semibold text-[#1a1a1a] truncate flex-1">{session.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#cc2b2b] hover:bg-[#ffe4e4] hover:border-[#ff6b6b] border-2 border-transparent transition-all w-full"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex flex-col w-56 border-r-2 border-[#1a1a1a] h-screen sticky top-0 shrink-0">
        <NavContent />
      </div>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b-2 border-[#1a1a1a] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#ff6b6b] border-2 border-[#1a1a1a] rounded-xl flex items-center justify-center">
            <ChefHat size={14} className="text-white" />
          </div>
          <span className="font-black text-sm text-[#1a1a1a]">{restaurantName}</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 hover:bg-[#f5f0e8] rounded-xl border-2 border-transparent hover:border-[#1a1a1a] transition-all"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#1a1a1a]/40 z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 w-60 border-r-2 border-[#1a1a1a] z-50 lg:hidden"
            >
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 bg-white hover:bg-[#f5f0e8] rounded-lg border-2 border-[#1a1a1a]"
                >
                  <X size={14} />
                </button>
              </div>
              <NavContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
