"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { type BaseRendererProps } from "./types";
import { formatCurrency, BUDGET_CATEGORIES } from "./shared";

export function BudgetRenderer({ page, fields, updateField }: BaseRendererProps) {
  const items = (fields.items as Record<string, unknown>[]) || [];
  const totalBudget = parseFloat((fields.totalBudget as string) || "0") || 0;

  // Calculate totals
  const totalCost = items.reduce((sum, item) => {
    return sum + (parseFloat((item.totalCost as string) || "0") || 0);
  }, 0);

  const totalPaid = items.reduce((sum, item) => {
    return sum + (parseFloat((item.amountPaid as string) || "0") || 0);
  }, 0);

  const totalRemaining = totalCost - totalPaid;
  const budgetRemaining = totalBudget - totalCost;

  const addItem = () => {
    const newItem = {
      category: "",
      vendor: "",
      totalCost: "",
      amountPaid: "",
      notes: "",
    };
    updateField("items", [...items, newItem]);
  };

  const updateItem = (index: number, key: string, value: unknown) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    updateField("items", updated);
  };

  const removeItem = (index: number) => {
    updateField("items", items.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg p-8 md:p-12">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif font-light tracking-wide">
            {page.title}
          </h2>
          <div className="w-10 h-px bg-warm-400 mx-auto mt-4" />
        </div>

        {/* Budget Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 p-6 bg-warm-50 border border-warm-200">
          <div className="text-center">
            <p className="text-xs tracking-wider uppercase text-warm-500 mb-1">Total Budget</p>
            <Input
              type="number"
              value={(fields.totalBudget as string) || ""}
              onChange={(e) => updateField("totalBudget", e.target.value)}
              placeholder="0"
              className="text-center text-lg font-light"
            />
          </div>
          <div className="text-center">
            <p className="text-xs tracking-wider uppercase text-warm-500 mb-1">Total Cost</p>
            <p className="text-2xl font-light text-warm-700 py-2">{formatCurrency(totalCost)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs tracking-wider uppercase text-warm-500 mb-1">Total Paid</p>
            <p className="text-2xl font-light text-green-600 py-2">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs tracking-wider uppercase text-warm-500 mb-1">Still Owed</p>
            <p className={`text-2xl font-light py-2 ${totalRemaining > 0 ? "text-amber-600" : "text-green-600"}`}>
              {formatCurrency(totalRemaining)}
            </p>
          </div>
        </div>

        {/* Budget vs Actual */}
        {totalBudget > 0 && (
          <div className="mb-10 p-4 border border-warm-200 bg-warm-50/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-warm-600">Budget Progress</span>
              <span className={`text-sm font-medium ${budgetRemaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                {budgetRemaining >= 0 
                  ? `${formatCurrency(budgetRemaining)} under budget` 
                  : `${formatCurrency(Math.abs(budgetRemaining))} over budget`
                }
              </span>
            </div>
            <div className="h-2 bg-warm-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  totalCost <= totalBudget ? "bg-green-500" : "bg-red-500"
                }`}
                style={{ width: `${Math.min((totalCost / totalBudget) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Add Item Button */}
        <div className="flex justify-between items-center mb-6">
          <Label>Budget Items</Label>
          <Button variant="ghost" size="sm" onClick={addItem}>
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>
        </div>

        {/* Items Table */}
        {items.length > 0 && (
          <>
            {/* Table Header */}
            <div className="border-b-2 border-warm-800 pb-2 grid grid-cols-[1.5fr,1fr,1fr,1fr,1fr,1fr,40px] gap-2 mb-2">
              <span className="text-[10px] tracking-wider uppercase text-warm-500">Category</span>
              <span className="text-[10px] tracking-wider uppercase text-warm-500">Vendor</span>
              <span className="text-[10px] tracking-wider uppercase text-warm-500">Total Cost</span>
              <span className="text-[10px] tracking-wider uppercase text-warm-500">Paid</span>
              <span className="text-[10px] tracking-wider uppercase text-warm-500">Remaining</span>
              <span className="text-[10px] tracking-wider uppercase text-warm-500">Notes</span>
              <span></span>
            </div>

            {/* Table Rows */}
            <div className="space-y-2">
              {items.map((item, index) => {
                const itemTotalCost = parseFloat((item.totalCost as string) || "0") || 0;
                const itemAmountPaid = parseFloat((item.amountPaid as string) || "0") || 0;
                const itemRemaining = itemTotalCost - itemAmountPaid;

                return (
                  <div
                    key={index}
                    className="border-b border-warm-200 pb-2 grid grid-cols-[1.5fr,1fr,1fr,1fr,1fr,1fr,40px] gap-2 items-center group"
                  >
                    <select
                      value={(item.category as string) || ""}
                      onChange={(e) => updateItem(index, "category", e.target.value)}
                      className="px-2 py-1.5 border border-warm-300 text-sm focus:outline-none focus:border-warm-500 bg-white"
                    >
                      <option value="">Select...</option>
                      {BUDGET_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <Input
                      value={(item.vendor as string) || ""}
                      onChange={(e) => updateItem(index, "vendor", e.target.value)}
                      className="text-sm"
                      placeholder="Vendor name"
                    />
                    <Input
                      type="number"
                      value={(item.totalCost as string) || ""}
                      onChange={(e) => updateItem(index, "totalCost", e.target.value)}
                      className="text-sm"
                      placeholder="0"
                    />
                    <Input
                      type="number"
                      value={(item.amountPaid as string) || ""}
                      onChange={(e) => updateItem(index, "amountPaid", e.target.value)}
                      className="text-sm"
                      placeholder="0"
                    />
                    <div className={`text-sm px-2 py-1.5 ${itemRemaining > 0 ? "text-amber-600" : "text-green-600"}`}>
                      {formatCurrency(itemRemaining)}
                    </div>
                    <Input
                      value={(item.notes as string) || ""}
                      onChange={(e) => updateItem(index, "notes", e.target.value)}
                      className="text-sm"
                      placeholder="Notes"
                    />
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
        )}

        {items.length === 0 && (
          <p className="text-sm text-warm-400 italic text-center py-8">
            No budget items yet. Click &quot;Add Item&quot; to start tracking your expenses.
          </p>
        )}
      </div>
    </div>
  );
}
