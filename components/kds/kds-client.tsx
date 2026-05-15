"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Order, OrderStatus } from "@/lib/types";
import { formatTime } from "@/lib/utils";

function Timer({ createdAt }: { createdAt: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const update = () => setElapsed(Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [createdAt]);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const late = mins >= 15;
  return (
    <span style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 13, color: late ? "#cc2b2b" : "#6b6560" }}>
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </span>
  );
}

export function KDSClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [updating, setUpdating] = useState<string | null>(null);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (res.ok) setOrders(prev => prev.filter(o => o.id !== orderId));
    } finally { setUpdating(null); }
  };

  const pending   = orders.filter(o => o.status === "pending");
  const preparing = orders.filter(o => o.status === "preparing");

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a", letterSpacing: "-0.02em" }}>Kitchen Display</h1>
          <p style={{ fontSize: 13, color: "#a8a29e", fontWeight: 600, marginTop: 4 }}>Manage and track kitchen orders</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ padding: "8px 14px", background: "#fff8ec", border: "2px solid #ffb347" }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#8a6200" }}>{pending.length} Pending</span>
          </div>
          <div style={{ padding: "8px 14px", background: "#edf5ff", border: "2px solid #74b9ff" }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#1a5fa8" }}>{preparing.length} Preparing</span>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", border: "2px solid #1a1a1a", background: "#fff" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👨‍🍳</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 6 }}>Kitchen is clear</div>
          <div style={{ fontSize: 13, color: "#a8a29e" }}>All orders have been prepared</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          {orders.map((order, i) => {
            const isPending = order.status === "pending";
            const borderColor = isPending ? "#ffb347" : "#74b9ff";
            const headerBg = isPending ? "#fff8ec" : "#edf5ff";
            return (
              <motion.div key={order.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                style={{ background: "#fff", border: `2px solid ${borderColor}`, display: "flex", flexDirection: "column" }}>
                {/* Card header */}
                <div style={{ padding: "10px 14px", background: headerBg, borderBottom: `2px solid ${borderColor}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 900, fontSize: 14, color: "#1a1a1a" }}>#{order.orderNumber}</span>
                    {order.tableNumber && <span style={{ fontSize: 11, color: "#6b6560", fontWeight: 600 }}>· Table {order.tableNumber}</span>}
                  </div>
                  <Timer createdAt={order.createdAt} />
                </div>

                {/* Items */}
                <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  {order.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ width: 22, height: 22, background: "#1a1a1a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, flexShrink: 0 }}>
                        {item.quantity}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a1a", lineHeight: 1.3 }}>{item.name}</div>
                        {item.notes && <div style={{ fontSize: 11, color: "#a8a29e", marginTop: 2 }}>{item.notes}</div>}
                      </div>
                    </div>
                  ))}
                  {order.notes && (
                    <div style={{ padding: "8px 10px", background: "#fff8ec", border: "1.5px solid #ffb347", marginTop: 4, fontSize: 12, color: "#8a6200", fontStyle: "italic" }}>
                      {order.notes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ padding: "10px 14px", borderTop: `1.5px solid ${borderColor}` }}>
                  <div style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", border: `1.5px solid ${borderColor}`, background: headerBg, color: isPending ? "#8a6200" : "#1a5fa8", display: "inline-block", marginBottom: 8, textTransform: "capitalize" }}>
                    {order.status}
                  </div>
                  {isPending ? (
                    <button disabled={updating === order.id} onClick={() => updateStatus(order.id, "preparing")}
                      style={{ width: "100%", padding: "8px", border: "2px solid #1a1a1a", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 800, fontFamily: "inherit", opacity: updating === order.id ? 0.5 : 1 }}>
                      {updating === order.id ? "..." : "Start Preparing"}
                    </button>
                  ) : (
                    <button disabled={updating === order.id} onClick={() => updateStatus(order.id, "ready")}
                      style={{ width: "100%", padding: "8px", border: "2px solid #1a1a1a", background: "#1a1a1a", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 800, fontFamily: "inherit", opacity: updating === order.id ? 0.5 : 1 }}>
                      {updating === order.id ? "..." : "✓ Mark Ready"}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
