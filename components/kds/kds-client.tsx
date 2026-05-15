"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { Order, OrderStatus } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { ChefHat, Timer, CheckCircle } from "lucide-react";

interface KDSClientProps {
  initialOrders: Order[];
}

function OrderTimer({ createdAt }: { createdAt: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const update = () => {
      setElapsed(Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [createdAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const isLate = mins >= 15;

  return (
    <span className={`text-xs font-mono font-semibold ${isLate ? "text-red-600" : "text-stone-600"}`}>
      {mins.toString().padStart(2, "0")}:{secs.toString().padStart(2, "0")}
    </span>
  );
}

export function KDSClient({ initialOrders }: KDSClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatus = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      }
    } finally {
      setUpdating(null);
    }
  };

  const pending = orders.filter((o) => o.status === "pending");
  const preparing = orders.filter((o) => o.status === "preparing");

  return (
    <div>
      <PageHeader
        title="Kitchen Display"
        description="Manage and track kitchen orders"
        action={
          <div className="flex gap-2">
            <div className="px-3 py-1.5 bg-amber-50 border-2 border-amber-200 rounded-xl">
              <span className="text-xs font-medium text-amber-700">
                {pending.length} Pending
              </span>
            </div>
            <div className="px-3 py-1.5 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <span className="text-xs font-medium text-blue-700">
                {preparing.length} Preparing
              </span>
            </div>
          </div>
        }
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={<ChefHat size={24} />}
          title="Kitchen is clear"
          description="All orders have been prepared"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className={`bg-white border-2 rounded-2xl overflow-hidden ${
                order.status === "pending"
                  ? "border-amber-300"
                  : "border-blue-300"
              }`}
            >
              {/* Header */}
              <div
                className={`px-4 py-3 flex items-center justify-between ${
                  order.status === "pending" ? "bg-amber-50" : "bg-blue-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">#{order.orderNumber}</span>
                  {order.tableNumber && (
                    <span className="text-xs text-stone-600">
                      · Table {order.tableNumber}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Timer size={12} className="text-stone-500" />
                  <OrderTimer createdAt={order.createdAt} />
                </div>
              </div>

              {/* Items */}
              <div className="p-4 space-y-2">
                {order.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-black text-white text-[10px] font-bold rounded-md flex items-center justify-center shrink-0">
                      {item.quantity}
                    </span>
                    <div>
                      <p className="text-sm font-medium leading-tight">{item.name}</p>
                      {item.notes && (
                        <p className="text-xs text-stone-500 mt-0.5">{item.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
                {order.notes && (
                  <div className="pt-2 border-t border-stone-100">
                    <p className="text-xs text-stone-500 italic">{order.notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-4 pb-4">
                <Badge
                  variant={order.status === "pending" ? "warning" : "info"}
                  className="mb-2"
                >
                  {order.status}
                </Badge>
                <div className="flex gap-2">
                  {order.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      loading={updating === order.id}
                      onClick={() => handleStatus(order.id, "preparing")}
                    >
                      Start Prep
                    </Button>
                  )}
                  {order.status === "preparing" && (
                    <Button
                      size="sm"
                      className="flex-1"
                      loading={updating === order.id}
                      onClick={() => handleStatus(order.id, "ready")}
                    >
                      <CheckCircle size={14} />
                      Mark Ready
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
