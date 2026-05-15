"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { InventoryItem } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Package, Plus, Pencil, AlertTriangle, Search, Minus, TrendingDown } from "lucide-react";

interface InventoryClientProps {
  initialItems: InventoryItem[];
}

export function InventoryClient({ initialItems }: InventoryClientProps) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [restockModal, setRestockModal] = useState<InventoryItem | null>(null);
  const [restockAmount, setRestockAmount] = useState("");

  const [form, setForm] = useState({
    name: "",
    unit: "",
    quantity: "",
    minQuantity: "5",
    cost: "",
    category: "",
    supplier: "",
  });

  const lowStock = items.filter((i) => i.quantity <= i.minQuantity);

  const filtered = items.filter(
    (i) =>
      !search ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setForm({
        name: item.name,
        unit: item.unit,
        quantity: item.quantity.toString(),
        minQuantity: item.minQuantity.toString(),
        cost: item.cost.toString(),
        category: item.category,
        supplier: item.supplier || "",
      });
    } else {
      setEditingItem(null);
      setForm({ name: "", unit: "kg", quantity: "", minQuantity: "5", cost: "", category: "", supplier: "" });
    }
    setModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      quantity: parseFloat(form.quantity),
      minQuantity: parseFloat(form.minQuantity),
      cost: parseFloat(form.cost),
    };

    try {
      if (editingItem) {
        const res = await fetch(`/api/inventory/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setItems((prev) => prev.map((i) => (i.id === editingItem.id ? data.item : i)));
        }
      } else {
        const res = await fetch("/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setItems((prev) => [...prev, data.item]);
        }
      }
      setModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async () => {
    if (!restockModal || !restockAmount) return;
    const amount = parseFloat(restockAmount);
    const newQty = restockModal.quantity + amount;
    const res = await fetch(`/api/inventory/${restockModal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: newQty, lastRestocked: new Date().toISOString() }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((i) => (i.id === restockModal.id ? { ...i, quantity: newQty } : i))
      );
    }
    setRestockModal(null);
    setRestockAmount("");
  };

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Track and manage stock levels"
        action={
          <Button size="sm" onClick={() => openModal()}>
            <Plus size={14} />
            Add Item
          </Button>
        }
      />

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 mb-4 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700">
            <strong>{lowStock.length} items</strong> are running low:{" "}
            {lowStock.map((i) => i.name).join(", ")}
          </p>
        </div>
      )}

      <div className="mb-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search inventory..."
          icon={<Search size={15} />}
          className="max-w-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package size={24} />}
          title="No inventory items"
          description="Add your first inventory item"
          action={<Button onClick={() => openModal()}>Add Item</Button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((item, i) => {
            const isLow = item.quantity <= item.minQuantity;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className={isLow ? "border-amber-300" : ""}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-stone-500">{item.category}</p>
                    </div>
                    <Badge variant={isLow ? "warning" : "success"}>
                      {isLow ? "Low" : "OK"}
                    </Badge>
                  </div>

                  {/* Stock Bar */}
                  <div className="mb-3">
                    <div className="flex items-end justify-between mb-1">
                      <span className="text-lg font-bold">
                        {item.quantity} {item.unit}
                      </span>
                      <span className="text-xs text-stone-400">
                        min: {item.minQuantity}
                      </span>
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isLow ? "bg-amber-400" : "bg-green-400"}`}
                        style={{
                          width: `${Math.min(100, (item.quantity / (item.minQuantity * 3)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500 mb-3">
                    <span>{formatCurrency(item.cost)}/{item.unit}</span>
                    {item.supplier && <span>{item.supplier}</span>}
                  </div>

                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        setRestockModal(item);
                        setRestockAmount("");
                      }}
                    >
                      <Plus size={12} />
                      Restock
                    </Button>
                    <button
                      onClick={() => openModal(item)}
                      className="p-2 hover:bg-stone-100 rounded-lg"
                    >
                      <Pencil size={13} />
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editingItem ? "Edit Item" : "Add Inventory Item"}
        size="md"
      >
        <form onSubmit={handleSave} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              label="Unit (kg, litre, pcs)"
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Current Quantity"
              type="number"
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              required
            />
            <Input
              label="Min Quantity (alert)"
              type="number"
              value={form.minQuantity}
              onChange={(e) => setForm((f) => ({ ...f, minQuantity: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Cost per unit ($)"
              type="number"
              step="0.01"
              value={form.cost}
              onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
              required
            />
            <Input
              label="Category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="e.g. Meat, Grains"
              required
            />
          </div>
          <Input
            label="Supplier (optional)"
            value={form.supplier}
            onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}
          />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={loading}>
              {editingItem ? "Save" : "Add Item"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Restock Modal */}
      <Modal
        isOpen={!!restockModal}
        onClose={() => setRestockModal(null)}
        title={`Restock ${restockModal?.name}`}
        size="sm"
      >
        <div className="p-4 space-y-3">
          <p className="text-sm text-stone-600">
            Current: <strong>{restockModal?.quantity} {restockModal?.unit}</strong>
          </p>
          <Input
            label={`Add quantity (${restockModal?.unit})`}
            type="number"
            value={restockAmount}
            onChange={(e) => setRestockAmount(e.target.value)}
            placeholder="e.g. 10"
            autoFocus
          />
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setRestockModal(null)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleRestock}>
              Confirm Restock
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
