"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  Grid3X3,
  Package,
  Users,
  BarChart3,
  Bell,
  Settings,
  ChefHat,
  LogOut,
  Menu,
  X,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { Session } from "@/lib/types";

interface SidebarProps {
  session: Session;
  restaurantName?: string;
}

const allNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: null },
  { href: "/admin/pos", label: "POS", icon: ShoppingCart, permission: "pos" },
  { href: "/admin/orders", label: "Orders", icon: UtensilsCrossed, permission: null },
  { href: "/admin/tables", label: "Tables", icon: Grid3X3, permission: "tables" },
  { href: "/admin/kds", label: "Kitchen", icon: ChefHat, permission: "kds" },
  { href: "/admin/menu", label: "Menu", icon: Layers, permission: "menu" },
  { href: "/admin/inventory", label: "Inventory", icon: Package, permission: "inventory" },
  { href: "/admin/staff", label: "Staff", icon: Users, permission: "staff" },
  { href: "/admin/reports", label: "Reports", icon: BarChart3, permission: "reports" },
  { href: "/admin/notifications", label: "Notifications", icon: Bell, permission: null },
  { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings" },
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
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b-2 border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
            <ChefHat size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none">{restaurantName}</p>
            <p className="text-xs text-stone-500 capitalize mt-0.5">
              {session.role.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-black text-white"
                  : "text-stone-600 hover:bg-stone-100 hover:text-black"
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t-2 border-stone-100">
        <div className="flex items-center gap-2 px-3 py-2 mb-1">
          <div className="w-7 h-7 bg-stone-200 rounded-lg flex items-center justify-center text-xs font-bold">
            {session.email[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{session.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-red-50 hover:text-red-600 transition-all w-full"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-56 border-r-2 border-stone-200 bg-white h-screen sticky top-0 shrink-0">
        <NavContent />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b-2 border-stone-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
            <ChefHat size={14} className="text-white" />
          </div>
          <span className="font-bold text-sm">{restaurantName}</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 hover:bg-stone-100 rounded-xl"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 border-r-2 border-stone-200 lg:hidden"
            >
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 hover:bg-stone-100 rounded-xl"
                >
                  <X size={18} />
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
