"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import type { Table, Floor, TableStatus } from "@/lib/types";
import { Grid3X3 } from "lucide-react";

interface TablesClientProps {
  initialTables: Table[];
  initialFloors: Floor[];
}

const statusColors: Record<TableStatus, string> = {
  available: "bg-green-50 border-green-300 text-green-700",
  occupied: "bg-red-50 border-red-300 text-red-700",
  reserved: "bg-amber-50 border-amber-300 text-amber-700",
  cleaning: "bg-blue-50 border-blue-300 text-blue-700",
};

const statusVariant: Record<TableStatus, "default" | "success" | "warning" | "danger" | "info"> = {
  available: "success",
  occupied: "danger",
  reserved: "warning",
  cleaning: "info",
};

const statuses: TableStatus[] = ["available", "occupied", "reserved", "cleaning"];

export function TablesClient({ initialTables, initialFloors }: TablesClientProps) {
  const [tables, setTables] = useState(initialTables);
  const [floors] = useState(initialFloors);
  const [selectedFloor, setSelectedFloor] = useState(floors[0]?.id || "");
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [statusModal, setStatusModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const floorTables = tables.filter((t) => t.floorId === selectedFloor);

  const handleStatusChange = async (status: TableStatus) => {
    if (!selectedTable) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/tables/${selectedTable.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setTables((prev) =>
          prev.map((t) =>
            t.id === selectedTable.id ? { ...t, status } : t
          )
        );
        setSelectedTable((prev) => prev ? { ...prev, status } : null);
      }
    } finally {
      setUpdating(false);
      setStatusModal(false);
    }
  };

  const stats = {
    available: tables.filter((t) => t.status === "available").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
    cleaning: tables.filter((t) => t.status === "cleaning").length,
  };

  return (
    <div>
      <PageHeader
        title="Table Management"
        description="Monitor and manage restaurant tables"
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {statuses.map((s) => (
          <div
            key={s}
            className={`p-3 border-2 rounded-xl text-center ${statusColors[s]}`}
          >
            <p className="text-lg font-bold">{stats[s]}</p>
            <p className="text-xs capitalize">{s}</p>
          </div>
        ))}
      </div>

      {/* Floor Tabs */}
      {floors.length > 0 ? (
        <>
          <div className="flex gap-2 mb-4">
            {floors.map((floor) => (
              <button
                key={floor.id}
                onClick={() => setSelectedFloor(floor.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                  selectedFloor === floor.id
                    ? "bg-black text-white border-black"
                    : "bg-white border-stone-200 text-stone-600 hover:border-black"
                }`}
              >
                {floor.name}
              </button>
            ))}
          </div>

          {/* Table Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {floorTables.map((table, i) => (
              <motion.button
                key={table.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelectedTable(table);
                  setStatusModal(true);
                }}
                className={`aspect-square border-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${statusColors[table.status]}`}
              >
                <span className="text-base font-bold">{table.number}</span>
                <span className="text-[10px] opacity-70">{table.capacity}p</span>
                <Badge variant={statusVariant[table.status]} className="text-[10px]">
                  {table.status}
                </Badge>
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={<Grid3X3 size={24} />}
          title="No tables configured"
          description="Seed sample data to see tables"
        />
      )}

      {/* Status Update Modal */}
      <Modal
        isOpen={statusModal}
        onClose={() => setStatusModal(false)}
        title={`Table ${selectedTable?.number}`}
        size="sm"
      >
        {selectedTable && (
          <div className="p-4">
            <p className="text-sm text-stone-600 mb-4">
              Capacity: {selectedTable.capacity} | Current:{" "}
              <Badge variant={statusVariant[selectedTable.status]}>
                {selectedTable.status}
              </Badge>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={updating}
                  className={`p-3 border-2 rounded-xl text-sm font-medium capitalize transition-all ${
                    selectedTable.status === status
                      ? statusColors[status]
                      : "border-stone-200 hover:border-stone-400"
                  } ${updating ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
