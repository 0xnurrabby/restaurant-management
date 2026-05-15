"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/lib/types";
import { formatCurrency, formatTime } from "@/lib/utils";
import Link from "next/link";

interface RecentOrdersProps {
  orders: Order[];
}

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  preparing: "info",
  ready: "success",
  served: "default",
  completed: "success",
  cancelled: "danger",
};

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <Link
          href="/admin/orders"
          className="text-xs text-stone-500 hover:text-black transition-colors"
        >
          View all
        </Link>
      </CardHeader>
      <div className="space-y-2">
        {orders.length === 0 ? (
          <p className="text-sm text-stone-400 py-4 text-center">No orders yet</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-3 p-2.5 bg-stone-50 rounded-xl"
            >
              <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                #{order.orderNumber}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {order.customerName || order.tableNumber
                    ? `Table ${order.tableNumber}`
                    : "Walk-in"}
                </p>
                <p className="text-xs text-stone-500">
                  {formatTime(order.createdAt)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-semibold">
                  {formatCurrency(order.total)}
                </p>
                <Badge variant={statusVariant[order.status] || "default"}>
                  {order.status}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
