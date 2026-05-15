"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Order, OrderStatus } from "@/lib/types";
import { formatCurrency, formatTime, formatDate } from "@/lib/utils";
import { Search, ShoppingCart, Filter } from "lucide-react";

interface OrdersClientProps {
  initialOrders: Order[];
}

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  preparing: "info",
  ready: "success",
  served: "default",
  completed: "success",
  cancelled: "danger",
};

const statuses: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Preparing", value: "preparing" },
  { label: "Ready", value: "ready" },
  { label: "Served", value: "served" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.orderNumber.toString().includes(search) ||
      o.tableNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
      }
    } finally {
      setUpdating(null);
    }
  };

  const nextStatus: Record<string, OrderStatus> = {
    pending: "preparing",
    preparing: "ready",
    ready: "served",
    served: "completed",
  };

  return (
    <div>
      <PageHeader title="Orders" description="Manage and track all orders" />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order #, table, customer..."
          icon={<Search size={15} />}
          className="sm:max-w-xs"
        />
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all ${
                statusFilter === s.value
                  ? "bg-black text-white border-black"
                  : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart size={24} />}
          title="No orders found"
          description="Orders will appear here once customers place them"
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center text-xs font-bold shrink-0">
                    #{order.orderNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold">
                        {order.tableNumber
                          ? `Table ${order.tableNumber}`
                          : order.customerName || "Walk-in"}
                      </span>
                      <Badge variant={statusVariant[order.status]}>
                        {order.status}
                      </Badge>
                      <Badge variant="outline">{order.type.replace("_", " ")}</Badge>
                    </div>
                    <div className="flex gap-3 text-xs text-stone-500">
                      <span>{order.items.length} items</span>
                      <span>{formatDate(order.createdAt)} {formatTime(order.createdAt)}</span>
                    </div>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      {order.items.slice(0, 3).map((item, j) => (
                        <span key={j} className="text-xs bg-stone-100 px-2 py-0.5 rounded-lg">
                          {item.quantity}x {item.name}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-xs text-stone-400">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-2">
                    <span className="text-sm font-bold">{formatCurrency(order.total)}</span>
                    {nextStatus[order.status] && (
                      <Button
                        size="sm"
                        variant="outline"
                        loading={updating === order.id}
                        onClick={() =>
                          handleStatusUpdate(order.id, nextStatus[order.status])
                        }
                      >
                        → {nextStatus[order.status]}
                      </Button>
                    )}
                    {order.status === "pending" && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleStatusUpdate(order.id, "cancelled")}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
