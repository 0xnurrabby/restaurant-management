"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { RestaurantSettings } from "@/lib/types";
import { Settings, Store, Clock, Bell, CreditCard, RefreshCw } from "lucide-react";

interface SettingsClientProps {
  initialSettings: RestaurantSettings;
}

const tabs = [
  { key: "restaurant", label: "Restaurant", icon: Store },
  { key: "hours", label: "Hours", icon: Clock },
  { key: "pos", label: "POS", icon: CreditCard },
  { key: "notifications", label: "Notifications", icon: Bell },
];

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState("restaurant");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(`Seeded: ${JSON.stringify(data.seeded)}`);
      }
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure restaurant preferences"
        action={
          <Button onClick={handleSave} loading={loading}>
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        }
      />

      <div className="flex gap-2 mb-5 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
              activeTab === tab.key
                ? "bg-black text-white border-black"
                : "bg-white border-stone-200 text-stone-600 hover:border-black"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "restaurant" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Information</CardTitle>
            </CardHeader>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Restaurant Name"
                value={settings.name}
                onChange={(e) => setSettings((s) => ({ ...s, name: e.target.value }))}
              />
              <Input
                label="Tagline"
                value={settings.tagline}
                onChange={(e) => setSettings((s) => ({ ...s, tagline: e.target.value }))}
              />
              <Input
                label="Phone"
                value={settings.phone}
                onChange={(e) => setSettings((s) => ({ ...s, phone: e.target.value }))}
              />
              <Input
                label="Email"
                value={settings.email}
                onChange={(e) => setSettings((s) => ({ ...s, email: e.target.value }))}
              />
              <Input
                label="Address"
                value={settings.address}
                onChange={(e) => setSettings((s) => ({ ...s, address: e.target.value }))}
                className="sm:col-span-2"
              />
              <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                <Input
                  label="Currency"
                  value={settings.currency}
                  onChange={(e) => setSettings((s) => ({ ...s, currency: e.target.value }))}
                />
                <Input
                  label="Tax Rate (%)"
                  type="number"
                  step="0.1"
                  value={settings.taxRate}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, taxRate: parseFloat(e.target.value) }))
                  }
                />
              </div>
            </div>
          </Card>

          {/* Seed Data */}
          <Card>
            <CardHeader>
              <CardTitle>Sample Data</CardTitle>
            </CardHeader>
            <p className="text-sm text-stone-500 mb-3">
              Populate the database with sample menu items, tables, floors, and inventory.
            </p>
            <Button
              variant="secondary"
              onClick={handleSeedData}
              loading={seeding}
            >
              <RefreshCw size={14} />
              Seed Sample Data
            </Button>
          </Card>
        </div>
      )}

      {activeTab === "hours" && (
        <Card>
          <CardHeader>
            <CardTitle>Opening Hours</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {settings.openingHours.map((day, i) => (
              <div key={day.day} className="flex items-center gap-3">
                <div className="w-24 text-sm font-medium">{day.day}</div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={day.isOpen}
                    onChange={(e) => {
                      const updated = [...settings.openingHours];
                      updated[i] = { ...day, isOpen: e.target.checked };
                      setSettings((s) => ({ ...s, openingHours: updated }));
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{day.isOpen ? "Open" : "Closed"}</span>
                </label>
                {day.isOpen && (
                  <>
                    <Input
                      type="time"
                      value={day.open}
                      onChange={(e) => {
                        const updated = [...settings.openingHours];
                        updated[i] = { ...day, open: e.target.value };
                        setSettings((s) => ({ ...s, openingHours: updated }));
                      }}
                      className="w-28"
                    />
                    <span className="text-stone-400 text-sm">to</span>
                    <Input
                      type="time"
                      value={day.close}
                      onChange={(e) => {
                        const updated = [...settings.openingHours];
                        updated[i] = { ...day, close: e.target.value };
                        setSettings((s) => ({ ...s, openingHours: updated }));
                      }}
                      className="w-28"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === "pos" && (
        <Card>
          <CardHeader>
            <CardTitle>POS Settings</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Default Discount (%)"
              type="number"
              value={settings.posSettings.defaultDiscount}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  posSettings: {
                    ...s.posSettings,
                    defaultDiscount: parseFloat(e.target.value),
                  },
                }))
              }
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.posSettings.requireTableForDineIn}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    posSettings: {
                      ...s.posSettings,
                      requireTableForDineIn: e.target.checked,
                    },
                  }))
                }
                className="rounded w-4 h-4"
              />
              <div>
                <p className="text-sm font-medium">Require table for dine-in</p>
                <p className="text-xs text-stone-500">Force table selection for dine-in orders</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.posSettings.printReceiptByDefault}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    posSettings: {
                      ...s.posSettings,
                      printReceiptByDefault: e.target.checked,
                    },
                  }))
                }
                className="rounded w-4 h-4"
              />
              <div>
                <p className="text-sm font-medium">Print receipt by default</p>
                <p className="text-xs text-stone-500">Auto-print receipt after payment</p>
              </div>
            </label>
          </div>
        </Card>
      )}

      {activeTab === "notifications" && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notificationSettings.emailNotifications}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    notificationSettings: {
                      ...s.notificationSettings,
                      emailNotifications: e.target.checked,
                    },
                  }))
                }
                className="rounded w-4 h-4"
              />
              <div>
                <p className="text-sm font-medium">Email notifications</p>
                <p className="text-xs text-stone-500">Send emails for important alerts</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notificationSettings.soundAlerts}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    notificationSettings: {
                      ...s.notificationSettings,
                      soundAlerts: e.target.checked,
                    },
                  }))
                }
                className="rounded w-4 h-4"
              />
              <div>
                <p className="text-sm font-medium">Sound alerts</p>
                <p className="text-xs text-stone-500">Play sounds for new orders and alerts</p>
              </div>
            </label>
            <Input
              label="Low stock alert threshold"
              type="number"
              value={settings.notificationSettings.lowStockThreshold}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  notificationSettings: {
                    ...s.notificationSettings,
                    lowStockThreshold: parseInt(e.target.value),
                  },
                }))
              }
            />
          </div>
        </Card>
      )}
    </div>
  );
}
