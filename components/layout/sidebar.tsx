"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingCart, UtensilsCrossed,
  Grid3X3, Package, Users, BarChart3, Bell,
  Settings, ChefHat, LogOut, Menu as MenuIcon, X, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { Session } from "@/lib/types";

interface SidebarProps {
  session: Session;
  restaurantName?: string;
}

const NAV = [
  { href: "/admin",               label: "Dashboard",  icon: LayoutDashboard, perm: null,        dot: "#ff6b6b" },
  { href: "/admin/pos",           label: "POS",        icon: ShoppingCart,    perm: "pos",        dot: "#ff6b6b" },
  { href: "/admin/orders",        label: "Orders",     icon: UtensilsCrossed, perm: null,         dot: "#ffb347" },
  { href: "/admin/tables",        label: "Tables",     icon: Grid3X3,         perm: "tables",     dot: "#74b9ff" },
  { href: "/admin/kds",           label: "Kitchen",    icon: ChefHat,         perm: "kds",        dot: "#52c4a0" },
  { href: "/admin/menu",          label: "Menu",       icon: Layers,          perm: "menu",       dot: "#a29bfe" },
  { href: "/admin/inventory",     label: "Inventory",  icon: Package,         perm: "inventory",  dot: "#fd79a8" },
  { href: "/admin/staff",         label: "Staff",      icon: Users,           perm: "staff",      dot: "#ffb347" },
  { href: "/admin/reports",       label: "Reports",    icon: BarChart3,       perm: "reports",    dot: "#52c4a0" },
  { href: "/admin/notifications", label: "Alerts",     icon: Bell,            perm: null,         dot: "#ff6b6b" },
  { href: "/admin/settings",      label: "Settings",   icon: Settings,        perm: "settings",   dot: "#a8a29e" },
];

function NavLinks({ session, pathname, onClose }: { session: Session; pathname: string; onClose?: () => void }) {
  const items = NAV.filter(item => {
    if (!item.perm) return true;
    if (session.role === "main_admin" || session.role === "admin") return true;
    return session.permissions.includes(item.perm as never);
  });

  return (
    <div style={{ padding: "8px 10px", flex: 1, overflowY: "auto" }}>
      {items.map((item) => {
        const exact = item.href === "/admin";
        const active = exact ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 10,
              marginBottom: 2,
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
              border: "2px solid",
              borderColor: active ? "#1a1a1a" : "transparent",
              background: active ? "#1a1a1a" : "transparent",
              color: active ? "#fff" : "#6b6560",
              transition: "all 0.12s ease",
            }}
            onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "#f5f0e8"; (e.currentTarget as HTMLElement).style.color = "#1a1a1a"; (e.currentTarget as HTMLElement).style.borderColor = "#1a1a1a"; } }}
            onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#6b6560"; (e.currentTarget as HTMLElement).style.borderColor = "transparent"; } }}
          >
            {/* Dot */}
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: active ? "#fff" : item.dot, border: "1.5px solid", borderColor: active ? "rgba(255,255,255,0.4)" : "#1a1a1a", flexShrink: 0 }} />
            <item.icon size={15} style={{ flexShrink: 0 }} />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar({ session, restaurantName = "Zunayed" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#faf9f7" }}>
      {/* Logo */}
      <div style={{ padding: "18px 16px 14px", borderBottom: "2px solid #1a1a1a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "#ff6b6b", border: "2px solid #1a1a1a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
            🍽️
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 900, fontSize: 13, color: "#1a1a1a", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {restaurantName}
            </div>
            <div style={{ fontSize: 10, color: "#a8a29e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>
              {session.role.replace("_", " ")}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <NavLinks session={session} pathname={pathname} onClose={onClose} />

      {/* User + logout */}
      <div style={{ padding: "10px", borderTop: "2px solid #1a1a1a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#fff", border: "2px solid #e2ddd7", borderRadius: 10, marginBottom: 6 }}>
          <div style={{ width: 28, height: 28, background: "#ff6b6b", border: "2px solid #1a1a1a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, color: "#fff", flexShrink: 0 }}>
            {session.email[0].toUpperCase()}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {session.email}
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", borderRadius: 10, border: "2px solid transparent", background: "transparent", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#cc2b2b", transition: "all 0.12s ease" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fff0f0"; (e.currentTarget as HTMLElement).style.borderColor = "#ff6b6b"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "transparent"; }}
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div style={{ width: 210, flexShrink: 0, borderRight: "2px solid #1a1a1a", height: "100vh", position: "sticky", top: 0, display: "flex", flexDirection: "column" }} className="hidden lg:flex">
        <SidebarContent />
      </div>

      {/* Mobile topbar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 40, background: "#fff", borderBottom: "2px solid #1a1a1a", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }} className="lg:hidden">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "#ff6b6b", border: "2px solid #1a1a1a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🍽️</div>
          <span style={{ fontWeight: 900, fontSize: 14, color: "#1a1a1a" }}>{restaurantName}</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          style={{ width: 36, height: 36, background: "#f5f0e8", border: "2px solid #1a1a1a", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <MenuIcon size={17} />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.45)", zIndex: 50 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: -230 }} animate={{ x: 0 }} exit={{ x: -230 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 220, borderRight: "2px solid #1a1a1a", zIndex: 51, display: "flex", flexDirection: "column" }}
              className="lg:hidden"
            >
              <button onClick={() => setOpen(false)}
                style={{ position: "absolute", top: 12, right: 12, zIndex: 1, width: 28, height: 28, background: "#fff", border: "2px solid #1a1a1a", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={13} />
              </button>
              <SidebarContent onClose={() => setOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
