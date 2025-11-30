"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Gift, ShoppingBag, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { type BaseRendererProps } from "./types";
import { formatCurrency } from "./shared";

export function RegistryTrackerRenderer({ page, fields, updateField }: BaseRendererProps) {
  const registries = (fields.registries as Record<string, unknown>[]) || [];
  const items = (fields.items as Record<string, unknown>[]) || [];
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

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
    <div className="max-w-5xl mx-auto px-4 md:px-0">
      <div className="bg-white shadow-lg p-4 md:p-8 lg:p-12">
        {/* Page Header */}
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-serif font-light tracking-wide">
            {page.title}
          </h2>
          <div className="w-10 h-px bg-warm-400 mx-auto mt-3 md:mt-4" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-10">
          <div className="text-center p-2 md:p-4 bg-warm-50 border border-warm-200 rounded-lg">
            <p className="text-lg md:text-2xl font-light text-warm-700">{registries.length}</p>
            <p className="text-[9px] md:text-xs tracking-wider uppercase text-warm-500">Registries</p>
          </div>
          <div className="text-center p-2 md:p-4 bg-warm-50 border border-warm-200 rounded-lg">
            <p className="text-lg md:text-2xl font-light text-warm-700">
              {receivedItems}<span className="text-sm md:text-lg text-warm-400">/{totalItems}</span>
            </p>
            <p className="text-[9px] md:text-xs tracking-wider uppercase text-warm-500">Received</p>
          </div>
          <div className="text-center p-2 md:p-4 bg-warm-50 border border-warm-200 rounded-lg">
            <p className="text-lg md:text-2xl font-light text-green-600">{formatCurrency(totalValue)}</p>
            <p className="text-[9px] md:text-xs tracking-wider uppercase text-warm-500">Value</p>
          </div>
        </div>

        {/* Registries */}
        <div className="mb-8 md:mb-10">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
              <h3 className="text-base md:text-lg font-medium text-warm-700">Your Registries</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={addRegistry}>
              <Plus className="w-4 h-4 md:mr-1" />
              <span className="hidden md:inline">Add</span>
            </Button>
          </div>

          {registries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {registries.map((registry, index) => (
                <div key={index} className="p-2 md:p-3 border border-warm-200 rounded-lg group">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-warm-400 flex-shrink-0" />
                    <Input
                      value={(registry.store as string) || ""}
                      onChange={(e) => updateRegistry(index, "store", e.target.value)}
                      placeholder="Store name"
                      className="w-24 md:w-32 text-sm"
                    />
                    <Input
                      value={(registry.url as string) || ""}
                      onChange={(e) => updateRegistry(index, "url", e.target.value)}
                      placeholder="Registry URL"
                      className="flex-1 text-xs md:text-sm"
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
                      className="p-1 md:opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs md:text-sm text-warm-400 italic text-center py-4 md:py-6 bg-warm-50 rounded-lg">
              No registries added yet. Add links to your registries!
            </p>
          )}
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 md:w-5 md:h-5 text-pink-500" />
              <h3 className="text-base md:text-lg font-medium text-warm-700">Registry Items</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 md:mr-1" />
              <span className="hidden md:inline">Add</span>
            </Button>
          </div>

          {items.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
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
                          isComplete ? "bg-green-50 rounded" : ""
                        }`}
                      >
                        <Input
                          value={(item.item as string) || ""}
                          onChange={(e) => updateItem(index, "item", e.target.value)}
                          placeholder="Item name"
                          className={`text-sm ${isComplete ? "line-through text-warm-400" : ""}`}
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
                          className="px-2 py-1.5 border border-warm-300 text-sm focus:outline-none focus:border-warm-500 bg-white rounded"
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
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-2">
                {items.map((item, index) => {
                  const qty = parseInt(String(item.quantity)) || 1;
                  const rec = parseInt(String(item.received)) || 0;
                  const isComplete = rec >= qty;

                  return (
                    <div
                      key={index}
                      className={`border border-warm-200 rounded-lg overflow-hidden ${
                        isComplete ? "bg-green-50" : ""
                      }`}
                    >
                      <button
                        onClick={() => setExpandedItem(expandedItem === index ? null : index)}
                        className="w-full p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Gift className={`w-4 h-4 flex-shrink-0 ${isComplete ? "text-green-500" : "text-warm-400"}`} />
                          <span className={`font-medium text-sm truncate ${isComplete ? "line-through text-warm-400" : "text-warm-700"}`}>
                            {(item.item as string) || "New Item"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${isComplete ? "text-green-600" : "text-warm-500"}`}>
                            {rec}/{qty}
                          </span>
                          {expandedItem === index ? (
                            <ChevronUp className="w-4 h-4 text-warm-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-warm-400" />
                          )}
                        </div>
                      </button>
                      
                      {expandedItem === index && (
                        <div className="p-3 pt-0 space-y-2 border-t border-warm-100">
                          <Input
                            value={(item.item as string) || ""}
                            onChange={(e) => updateItem(index, "item", e.target.value)}
                            placeholder="Item name"
                            className="text-sm"
                          />
                          <div className="grid grid-cols-2 gap-2">
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
                              placeholder="Price"
                              className="text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <Label className="text-[10px] text-warm-500">Wanted</Label>
                              <Input
                                type="number"
                                value={(item.quantity as string) || "1"}
                                onChange={(e) => updateItem(index, "quantity", e.target.value)}
                                className="text-sm text-center"
                                min={1}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] text-warm-500">Received</Label>
                              <Input
                                type="number"
                                value={(item.received as string) || "0"}
                                onChange={(e) => updateItem(index, "received", e.target.value)}
                                className="text-sm text-center"
                                min={0}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] text-warm-500">Priority</Label>
                              <select
                                value={(item.priority as string) || ""}
                                onChange={(e) => updateItem(index, "priority", e.target.value)}
                                className="w-full px-2 py-1.5 border border-warm-300 text-sm bg-white rounded"
                              >
                                <option value="">-</option>
                                <option value="High">High</option>
                                <option value="Medium">Med</option>
                                <option value="Low">Low</option>
                              </select>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="w-full text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-xs md:text-sm text-warm-400 italic text-center py-6 md:py-8 bg-warm-50 rounded-lg">
              No items tracked yet. Add items from your registries!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
