"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Minus, Trash2, CreditCard, X, Percent, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import type { MenuItem, Category, Table, Floor, CartItem } from "@/lib/types";
import { formatCurrency, generateId } from "@/lib/utils";

interface POSClientProps {
  items: MenuItem[];
  categories: Category[];
  tables: Table[];
  floors: Floor[];
}

export function POSClient({ items, categories, tables, floors }: POSClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"method" | "processing" | "success">("method");
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [tableModal, setTableModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredItems = items.filter((item) => {
    const matchCat = selectedCategory === "all" || item.categoryId === selectedCategory;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        {
          id: generateId(),
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          image: item.image,
        },
      ];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const discountAmount = subtotal * (discount / 100);
  const tax = (subtotal - discountAmount) * 0.085;
  const total = subtotal - discountAmount + tax;

  const handlePayment = async () => {
    setLoading(true);
    setPaymentStep("processing");

    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 2000));

    // Create order
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: selectedTable?.id,
          tableNumber: selectedTable?.number,
          type: selectedTable ? "dine_in" : "takeaway",
          items: cart,
          subtotal,
          tax,
          discount: discountAmount,
          total,
          notes,
          isPaid: true,
          paymentMethod,
        }),
      });
    } catch {
      // continue
    }

    setPaymentStep("success");
    setLoading(false);
  };

  const handleNewOrder = () => {
    setCart([]);
    setSelectedTable(null);
    setDiscount(0);
    setNotes("");
    setPaymentModal(false);
    setPaymentStep("method");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full min-h-0">
      {/* Left: Menu */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu..."
            icon={<Search size={15} />}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="md"
            onClick={() => setTableModal(true)}
          >
            {selectedTable ? `Table ${selectedTable.number}` : "Select Table"}
          </Button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all ${
              selectedCategory === "all"
                ? "bg-black text-white border-black"
                : "bg-white border-stone-200 text-stone-600 hover:border-stone-400"
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all ${
                selectedCategory === cat.id
                  ? "bg-black text-white border-black"
                  : "bg-white border-stone-200 text-stone-600 hover:border-stone-400"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 overflow-y-auto">
          {filteredItems.map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => addToCart(item)}
              className="bg-white border-2 border-stone-200 rounded-2xl overflow-hidden text-left hover:border-black transition-all"
            >
              {item.image && (
                <div className="relative h-28 overflow-hidden bg-stone-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-2.5">
                <p className="text-xs font-semibold leading-tight mb-0.5 line-clamp-2">
                  {item.name}
                </p>
                <p className="text-xs font-bold text-stone-800">
                  {formatCurrency(item.price)}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="lg:w-80 bg-white border-2 border-stone-200 rounded-2xl flex flex-col">
        <div className="p-4 border-b-2 border-stone-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              Current Order
              {selectedTable && (
                <span className="text-stone-500 ml-1 font-normal">
                  · Table {selectedTable.number}
                </span>
              )}
            </h3>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-stone-400 text-sm">
              Add items from the menu
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 bg-stone-50 rounded-xl"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.name}</p>
                  <p className="text-xs text-stone-500">
                    {formatCurrency(item.price)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="w-6 h-6 bg-stone-200 rounded-lg flex items-center justify-center hover:bg-stone-300"
                  >
                    <Minus size={10} />
                  </button>
                  <span className="text-xs font-semibold w-5 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="w-6 h-6 bg-black text-white rounded-lg flex items-center justify-center hover:bg-stone-800"
                  >
                    <Plus size={10} />
                  </button>
                </div>
                <span className="text-xs font-semibold min-w-12 text-right">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Discount + Notes */}
        {cart.length > 0 && (
          <div className="px-3 pb-2 space-y-2">
            <div className="flex gap-2">
              <Input
                type="number"
                value={discount || ""}
                onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                placeholder="Discount %"
                icon={<Percent size={14} />}
                className="text-xs"
              />
            </div>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Kitchen notes..."
              icon={<StickyNote size={14} />}
              className="text-xs"
            />
          </div>
        )}

        {/* Summary */}
        {cart.length > 0 && (
          <div className="px-4 py-3 border-t-2 border-stone-100 space-y-1.5">
            <div className="flex justify-between text-xs text-stone-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-xs text-green-600">
                <span>Discount ({discount}%)</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-stone-600">
              <span>Tax (8.5%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-1 border-t border-stone-100">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <Button
              className="w-full mt-2"
              size="lg"
              onClick={() => setPaymentModal(true)}
            >
              <CreditCard size={16} />
              Charge {formatCurrency(total)}
            </Button>
          </div>
        )}
      </div>

      {/* Table Modal */}
      <Modal isOpen={tableModal} onClose={() => setTableModal(false)} title="Select Table" size="lg">
        <div className="p-4">
          {floors.map((floor) => (
            <div key={floor.id} className="mb-4">
              <h4 className="text-xs font-semibold text-stone-500 mb-2">{floor.name}</h4>
              <div className="grid grid-cols-4 gap-2">
                {tables
                  .filter((t) => t.floorId === floor.id)
                  .map((table) => (
                    <button
                      key={table.id}
                      onClick={() => {
                        setSelectedTable(table);
                        setTableModal(false);
                      }}
                      className={`p-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                        table.status === "occupied"
                          ? "border-red-200 bg-red-50 text-red-600 cursor-not-allowed"
                          : selectedTable?.id === table.id
                          ? "border-black bg-black text-white"
                          : "border-stone-200 hover:border-black"
                      }`}
                      disabled={table.status === "occupied"}
                    >
                      {table.number}
                      <p className="font-normal text-[10px] opacity-70">{table.capacity}p</p>
                    </button>
                  ))}
              </div>
            </div>
          ))}
          {tables.length === 0 && (
            <p className="text-sm text-stone-400 text-center py-4">No tables configured</p>
          )}
          <div className="flex gap-2 mt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setSelectedTable(null);
                setTableModal(false);
              }}
            >
              No Table (Takeaway)
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={paymentModal} onClose={() => !loading && setPaymentModal(false)} title="Payment" size="sm">
        <div className="p-4">
          {paymentStep === "method" && (
            <div className="space-y-3">
              <p className="text-sm text-stone-600 mb-4">
                Total: <span className="font-bold text-black text-lg">{formatCurrency(total)}</span>
              </p>
              {["card", "cash", "mobile"].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`w-full flex items-center gap-3 p-3 border-2 rounded-xl text-sm font-medium transition-all ${
                    paymentMethod === method
                      ? "border-black bg-black text-white"
                      : "border-stone-200 hover:border-black"
                  }`}
                >
                  <CreditCard size={16} />
                  {method.charAt(0).toUpperCase() + method.slice(1)} Payment
                </button>
              ))}
              <Button className="w-full mt-2" size="lg" onClick={handlePayment}>
                Process Payment
              </Button>
            </div>
          )}
          {paymentStep === "processing" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-12 h-12 border-3 border-stone-200 border-t-black rounded-full animate-spin" />
              <p className="text-sm font-medium">Processing payment...</p>
              <p className="text-xs text-stone-500">Please wait</p>
            </div>
          )}
          {paymentStep === "success" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
              >
                <span className="text-3xl">✓</span>
              </motion.div>
              <p className="text-base font-semibold">Payment Successful!</p>
              <p className="text-sm text-stone-500">{formatCurrency(total)} received</p>
              <Button className="w-full" onClick={handleNewOrder}>
                New Order
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
