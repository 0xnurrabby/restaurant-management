"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Order, OrderStatus } from "@/lib/types";
import { formatCurrency, formatTime, formatDate } from "@/lib/utils";
import { Search } from "lucide-react";

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  pending:    { bg: "#fff8ec", color: "#8a6200", border: "#ffb347" },
  preparing:  { bg: "#edf5ff", color: "#1a5fa8", border: "#74b9ff" },
  ready:      { bg: "#edfaf5", color: "#1a7a5e", border: "#52c4a0" },
  served:     { bg: "#f5f0e8", color: "#6b6560", border: "#d4cdc3" },
  completed:  { bg: "#edfaf5", color: "#1a7a5e", border: "#52c4a0" },
  cancelled:  { bg: "#fff0f0", color: "#cc2b2b", border: "#ff6b6b" },
};

const STATUSES = ["all", "pending", "preparing", "ready", "served", "completed", "cancelled"];
const NEXT: Record<string, OrderStatus> = { pending: "preparing", preparing: "ready", ready: "served", served: "completed" };

export function OrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.orderNumber.toString().includes(search) || o.tableNumber?.toLowerCase().includes(search.toLowerCase()) || o.customerName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (res.ok) setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } finally { setUpdating(null); }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a", letterSpacing: "-0.02em" }}>Orders</h1>
        <p style={{ fontSize: 13, color: "#a8a29e", fontWeight: 600, marginTop: 4 }}>Manage and track all orders</p>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#a8a29e", pointerEvents: "none" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order #, table, customer..." style={{ width: "100%", maxWidth: 400, padding: "9px 10px 9px 30px", border: "2px solid #1a1a1a", fontSize: 13, outline: "none", fontFamily: "inherit", background: "#fff", display: "block" }} />
      </div>

      {/* Status filter tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 0, marginBottom: 16, border: "2px solid #1a1a1a", width: "fit-content" }}>
        {STATUSES.map((s, i) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: "7px 14px", fontSize: 12, fontWeight: 700, border: "none", borderRight: i < STATUSES.length - 1 ? "1px solid #e2ddd7" : "none", background: statusFilter === s ? "#1a1a1a" : "#fff", color: statusFilter === s ? "#fff" : "#6b6560", cursor: "pointer", textTransform: "capitalize" }}>
            {s}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", border: "2px solid #1a1a1a", background: "#fff" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🛒</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 6 }}>No orders found</div>
          <div style={{ fontSize: 13, color: "#a8a29e" }}>Orders will appear here once customers place them</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map((order, i) => {
            const sc = STATUS_COLORS[order.status] || STATUS_COLORS.served;
            const next = NEXT[order.status];
            return (
              <motion.div key={order.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                style={{ background: "#fff", border: "2px solid #1a1a1a", padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  {/* Order number */}
                  <div style={{ width: 40, height: 40, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, color: "#fff", flexShrink: 0 }}>
                    #{order.orderNumber}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: "#1a1a1a" }}>
                        {order.tableNumber ? `Table ${order.tableNumber}` : order.customerName || "Walk-in"}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", border: `1.5px solid ${sc.border}`, background: sc.bg, color: sc.color, textTransform: "capitalize" }}>
                        {order.status}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", border: "1.5px solid #e2ddd7", background: "#faf9f7", color: "#6b6560" }}>
                        {order.type.replace("_", " ")}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#a8a29e", fontWeight: 600, marginBottom: 6 }}>
                      {formatDate(order.createdAt)} · {formatTime(order.createdAt)} · {order.items.length} items
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {order.items.slice(0, 4).map((item, j) => (
                        <span key={j} style={{ fontSize: 11, background: "#f5f0e8", border: "1px solid #e2ddd7", padding: "2px 8px", color: "#6b6560", fontWeight: 600 }}>
                          {item.quantity}× {item.name}
                        </span>
                      ))}
                      {order.items.length > 4 && <span style={{ fontSize: 11, color: "#a8a29e" }}>+{order.items.length - 4} more</span>}
                    </div>
                  </div>

                  {/* Amount + actions */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: "#1a1a1a" }}>{formatCurrency(order.total)}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      {next && (
                        <button disabled={updating === order.id} onClick={() => updateStatus(order.id, next)}
                          style={{ padding: "6px 12px", border: "2px solid #1a1a1a", background: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "inherit", opacity: updating === order.id ? 0.5 : 1, textTransform: "capitalize" }}>
                          {updating === order.id ? "..." : `→ ${next}`}
                        </button>
                      )}
                      {order.status === "pending" && (
                        <button onClick={() => updateStatus(order.id, "cancelled")}
                          style={{ padding: "6px 10px", border: "2px solid #ff6b6b", background: "#fff0f0", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "inherit", color: "#cc2b2b" }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
