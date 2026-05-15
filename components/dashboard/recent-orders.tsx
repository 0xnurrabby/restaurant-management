"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/lib/types";
import { formatCurrency, formatTime } from "@/lib/utils";
import Link from "next/link";

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning", preparing: "info", ready: "success",
  served: "default", completed: "success", cancelled: "danger",
};

export function RecentOrders({ orders }: { orders: Order[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <Link href="/admin/orders" className="text-[10px] font-bold text-[#a8a29e] uppercase tracking-wide hover:text-[#1a1a1a] transition-colors">
          View all →
        </Link>
      </CardHeader>
      <div className="space-y-2">
        {orders.length === 0 ? (
          <p className="text-sm text-[#a8a29e] py-8 text-center font-medium">No orders yet</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="flex items-center gap-2.5 p-2.5 bg-[#faf9f7] border-2 border-[#e8e4de] rounded-xl hover:border-[#1a1a1a] transition-colors">
              <div className="w-8 h-8 bg-[#1a1a1a] text-white rounded-xl flex items-center justify-center text-[10px] font-black shrink-0">
                #{order.orderNumber}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#1a1a1a] truncate">
                  {order.tableNumber ? `Table ${order.tableNumber}` : order.customerName || "Walk-in"}
                </p>
                <p className="text-[10px] text-[#a8a29e] font-medium">{formatTime(order.createdAt)}</p>
              </div>
              <div className="text-right shrink-0 space-y-1">
                <p className="text-xs font-black text-[#1a1a1a]">{formatCurrency(order.total)}</p>
                <Badge variant={statusVariant[order.status] || "default"}>{order.status}</Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
