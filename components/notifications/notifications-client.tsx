"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Notification } from "@/lib/types";
import { formatTime, formatDate } from "@/lib/utils";
import { Bell, Package, ChefHat, ShoppingCart, Info, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationsClientProps {
  initialNotifications: Notification[];
}

const notifIcons: Record<string, React.ReactNode> = {
  new_order: <ShoppingCart size={16} />,
  low_stock: <Package size={16} />,
  kitchen_ready: <ChefHat size={16} />,
  billing: <Bell size={16} />,
  staff_activity: <Bell size={16} />,
  system: <Info size={16} />,
};

const notifColors: Record<string, string> = {
  new_order: "bg-blue-50 text-blue-600",
  low_stock: "bg-amber-50 text-amber-600",
  kitchen_ready: "bg-green-50 text-green-600",
  billing: "bg-purple-50 text-purple-600",
  staff_activity: "bg-stone-100 text-stone-600",
  system: "bg-stone-100 text-stone-600",
};

export function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isRead: true }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
        action={
          unreadCount > 0 && (
            <Button size="sm" variant="secondary" onClick={markAllRead}>
              <CheckCheck size={14} />
              Mark all read
            </Button>
          )
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={24} />}
          title="No notifications"
          description="Notifications will appear here"
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => !notif.isRead && markRead(notif.id)}
              className={cn(
                "bg-white border-2 rounded-2xl p-4 transition-all",
                notif.isRead
                  ? "border-stone-200 opacity-70"
                  : "border-stone-300 cursor-pointer hover:border-black"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-xl shrink-0", notifColors[notif.type] || notifColors.system)}>
                  {notifIcons[notif.type] || <Bell size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold">{notif.title}</p>
                    {!notif.isRead && (
                      <div className="w-2 h-2 bg-black rounded-full shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-stone-600">{notif.message}</p>
                  <p className="text-xs text-stone-400 mt-1">
                    {formatDate(notif.createdAt)} at {formatTime(notif.createdAt)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
