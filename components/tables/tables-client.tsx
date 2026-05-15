"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Table, Floor, TableStatus } from "@/lib/types";

const STATUS_STYLE: Record<TableStatus, { bg: string; border: string; color: string }> = {
  available: { bg: "#edfaf5", border: "#52c4a0", color: "#1a7a5e" },
  occupied:  { bg: "#fff0f0", border: "#ff6b6b", color: "#cc2b2b" },
  reserved:  { bg: "#fff8ec", border: "#ffb347", color: "#8a6200" },
  cleaning:  { bg: "#edf5ff", border: "#74b9ff", color: "#1a5fa8" },
};
const STATUSES: TableStatus[] = ["available", "occupied", "reserved", "cleaning"];

export function TablesClient({ initialTables, initialFloors }: { initialTables: Table[]; initialFloors: Floor[] }) {
  const [tables, setTables] = useState(initialTables);
  const [floors] = useState(initialFloors);
  const [selectedFloor, setSelectedFloor] = useState(floors[0]?.id || "");
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [updating, setUpdating] = useState(false);

  const floorTables = tables.filter(t => t.floorId === selectedFloor);
  const stats = {
    available: tables.filter(t => t.status === "available").length,
    occupied:  tables.filter(t => t.status === "occupied").length,
    reserved:  tables.filter(t => t.status === "reserved").length,
    cleaning:  tables.filter(t => t.status === "cleaning").length,
  };

  const changeStatus = async (status: TableStatus) => {
    if (!selectedTable) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/tables/${selectedTable.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (res.ok) {
        setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, status } : t));
        setSelectedTable(prev => prev ? { ...prev, status } : null);
      }
    } finally { setUpdating(false); }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a", letterSpacing: "-0.02em" }}>Table Management</h1>
        <p style={{ fontSize: 13, color: "#a8a29e", fontWeight: 600, marginTop: 4 }}>Monitor and manage restaurant tables</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
        {STATUSES.map(s => {
          const st = STATUS_STYLE[s];
          return (
            <div key={s} style={{ background: st.bg, border: `2px solid ${st.border}`, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a" }}>{stats[s]}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: st.color, textTransform: "capitalize", marginTop: 4 }}>{s}</div>
            </div>
          );
        })}
      </div>

      {/* Floor tabs */}
      {floors.length > 0 ? (
        <>
          <div style={{ display: "flex", gap: 0, marginBottom: 16, border: "2px solid #1a1a1a", width: "fit-content" }}>
            {floors.map((floor, i) => (
              <button key={floor.id} onClick={() => setSelectedFloor(floor.id)}
                style={{ padding: "8px 18px", fontSize: 13, fontWeight: 700, border: "none", borderRight: i < floors.length - 1 ? "1px solid #e2ddd7" : "none", background: selectedFloor === floor.id ? "#1a1a1a" : "#fff", color: selectedFloor === floor.id ? "#fff" : "#6b6560", cursor: "pointer" }}>
                {floor.name}
              </button>
            ))}
          </div>

          {/* Table grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8 }}>
            {floorTables.map((table, i) => {
              const st = STATUS_STYLE[table.status];
              return (
                <motion.button key={table.id} whileTap={{ scale: 0.96 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedTable(table)}
                  style={{ aspectRatio: "1", border: `2px solid ${st.border}`, background: st.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer" }}>
                  <span style={{ fontWeight: 900, fontSize: 16, color: "#1a1a1a" }}>{table.number}</span>
                  <span style={{ fontSize: 10, color: "#6b6560", fontWeight: 600 }}>{table.capacity}p</span>
                  <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 6px", border: `1px solid ${st.border}`, background: "#fff", color: st.color, textTransform: "capitalize" }}>{table.status}</span>
                </motion.button>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 0", border: "2px solid #1a1a1a", background: "#fff" }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 6 }}>No tables configured</div>
          <div style={{ fontSize: 13, color: "#a8a29e" }}>Go to Settings → Seed Sample Data to add tables</div>
        </div>
      )}

      {/* Status change modal */}
      {selectedTable && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(26,26,26,0.45)" }} onClick={() => setSelectedTable(null)} />
          <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ background: "#fff", border: "2px solid #1a1a1a", width: "100%", maxWidth: 320, position: "relative", zIndex: 1 }}>
            <div style={{ padding: "14px 18px", borderBottom: "2px solid #1a1a1a" }}>
              <div style={{ fontWeight: 900, fontSize: 15 }}>Table {selectedTable.number}</div>
              <div style={{ fontSize: 12, color: "#a8a29e", fontWeight: 600, marginTop: 2 }}>Capacity: {selectedTable.capacity} · Status: <span style={{ textTransform: "capitalize", color: "#1a1a1a" }}>{selectedTable.status}</span></div>
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#a8a29e", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Change Status</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {STATUSES.map(status => {
                  const st = STATUS_STYLE[status];
                  const active = selectedTable.status === status;
                  return (
                    <button key={status} onClick={() => changeStatus(status)} disabled={updating || active}
                      style={{ padding: "10px", border: `2px solid ${active ? st.border : "#e2ddd7"}`, background: active ? st.bg : "#faf9f7", color: active ? st.color : "#6b6560", cursor: active || updating ? "default" : "pointer", fontWeight: 700, fontSize: 12, textTransform: "capitalize", fontFamily: "inherit", opacity: updating ? 0.6 : 1 }}>
                      {status}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setSelectedTable(null)} style={{ width: "100%", marginTop: 10, padding: "9px", border: "2px solid #1a1a1a", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}>
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
