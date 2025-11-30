"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Gift, Package, ShoppingBag, ExternalLink } from "lucide-react";
import { type BaseRendererProps } from "./types";
import { formatCurrency } from "./shared";

export function RegistryTrackerRenderer({ page, fields, updateField }: BaseRendererProps) {
  const registries = (fields.registries as Record<string, unknown>[]) || [];
  const items = (fields.items as Record<string, unknown>[]) || [];

  const addRegistry = () => {
    updateField("registries", [...registries, { store: "", url: "" }]);
  };

  const updateRegistry = (index: number, key: string, value: string) => {
    const updated = [...registries];
    updated[index] = { ...updated[index], [key]: value };
    updateField("registries", updated);
  };

  const removeRegistry = (index: number) => {
    updateField("registries", registries.filter((_, i) => i !== index));
  };

  const addItem = () => {
    updateField("items", [...items, { item: "", store: "", price: "", quantity: 1, received: 0, priority: "" }]);
  };

  const updateItem = (index: number, key: string, value: unknown) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    updateField("items", updated);
  };

  const removeItem = (index: number) => {
    updateField("items", items.filter((_, i) => i !== index));
  };

  // Stats
  const totalItems = items.reduce((sum, item) => sum + (parseInt(String(item.quantity)) || 1), 0);
  const receivedItems = items.reduce((sum, item) => sum + (parseInt(String(item.received)) || 0), 0);
  const totalValue = items.reduce((sum, item) => {
    const price = parseFloat(String(item.price)) || 0;
    const qty = parseInt(String(item.quantity)) || 1;
    return sum + (price * qty);
  }, 0);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white shadow-lg p-8 md:p-12">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif font-light tracking-wide">
            {page.title}
          </h2>
          <div className="w-10 h-px bg-warm-400 mx-auto mt-4" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="text-center p-4 bg-warm-50 border border-warm-200">
            <p className="text-2xl font-light text-warm-700">{registries.length}</p>
            <p className="text-xs tracking-wider uppercase text-warm-500">Registries</p>
          </div>
          <div className="text-center p-4 bg-warm-50 border border-warm-200">
            <p className="text-2xl font-light text-warm-700">
              {receivedItems}<span className="text-lg text-warm-400">/{totalItems}</span>
            </p>
            <p className="text-xs tracking-wider uppercase text-warm-500">Items Received</p>
          </div>
          <div className="text-center p-4 bg-warm-50 border border-warm-200">
            <p className="text-2xl font-light text-green-600">{formatCurrency(totalValue)}</p>
            <p className="text-xs tracking-wider uppercase text-warm-500">Total Value</p>
          </div>
        </div>

        {/* Registries */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-medium text-warm-700">Your Registries</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={addRegistry}>
              <Plus className="w-4 h-4 mr-1" />
              Add Registry
            </Button>
          </div>

          {registries.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-3">
              {registries.map((registry, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border border-warm-200 rounded group">
                  <ShoppingBag className="w-4 h-4 text-warm-400 flex-shrink-0" />
                  <Input
                    value={(registry.store as string) || ""}
                    onChange={(e) => updateRegistry(index, "store", e.target.value)}
                    placeholder="Store name"
                    className="w-32"
                  />
                  <Input
                    value={(registry.url as string) || ""}
                    onChange={(e) => updateRegistry(index, "url", e.target.value)}
                    placeholder="Registry URL"
                    className="flex-1 text-sm"
                  />
                  {(registry.url as string) && (
                    <a
                      href={(registry.url as string)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-warm-500 hover:text-warm-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => removeRegistry(index)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-warm-400 italic text-center py-6 bg-warm-50 rounded">
              No registries added yet. Add links to your registries!
            </p>
          )}
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-pink-500" />
              <h3 className="text-lg font-medium text-warm-700">Registry Items</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>

          {items.length > 0 ? (
            <>
              {/* Table Header */}
              <div className="border-b-2 border-warm-800 pb-2 grid grid-cols-[2fr,1fr,80px,80px,80px,100px,40px] gap-2 mb-2">
                <span className="text-[10px] tracking-wider uppercase text-warm-500">Item</span>
                <span className="text-[10px] tracking-wider uppercase text-warm-500">Store</span>
                <span className="text-[10px] tracking-wider uppercase text-warm-500">Price</span>
                <span className="text-[10px] tracking-wider uppercase text-warm-500">Wanted</span>
                <span className="text-[10px] tracking-wider uppercase text-warm-500">Received</span>
                <span className="text-[10px] tracking-wider uppercase text-warm-500">Priority</span>
                <span></span>
              </div>

              <div className="space-y-2">
                {items.map((item, index) => {
                  const qty = parseInt(String(item.quantity)) || 1;
                  const rec = parseInt(String(item.received)) || 0;
                  const isComplete = rec >= qty;

                  return (
                    <div
                      key={index}
                      className={`border-b border-warm-200 pb-2 grid grid-cols-[2fr,1fr,80px,80px,80px,100px,40px] gap-2 items-center group ${
                        isComplete ? "bg-green-50" : ""
                      }`}
                    >
                      <Input
                        value={(item.item as string) || ""}
                        onChange={(e) => updateItem(index, "item", e.target.value)}
                        placeholder="Item name"
                        className={isComplete ? "line-through text-warm-400" : ""}
                      />
                      <Input
                        value={(item.store as string) || ""}
                        onChange={(e) => updateItem(index, "store", e.target.value)}
                        placeholder="Store"
                        className="text-sm"
                      />
                      <Input
                        type="number"
                        value={(item.price as string) || ""}
                        onChange={(e) => updateItem(index, "price", e.target.value)}
                        placeholder="$0"
                        className="text-sm"
                      />
                      <Input
                        type="number"
                        value={(item.quantity as string) || "1"}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                        className="text-sm text-center"
                        min={1}
                      />
                      <Input
                        type="number"
                        value={(item.received as string) || "0"}
                        onChange={(e) => updateItem(index, "received", e.target.value)}
                        className={`text-sm text-center ${isComplete ? "text-green-600" : ""}`}
                        min={0}
                      />
                      <select
                        value={(item.priority as string) || ""}
                        onChange={(e) => updateItem(index, "priority", e.target.value)}
                        className="px-2 py-1.5 border border-warm-300 text-sm focus:outline-none focus:border-warm-500 bg-white"
                      >
                        <option value="">Priority</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                      <button
                        onClick={() => removeItem(index)}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-sm text-warm-400 italic text-center py-8 bg-warm-50 rounded">
              No items tracked yet. Add items from your registries to track what you&apos;ve received!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
