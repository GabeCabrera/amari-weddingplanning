"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronDown, ChevronUp, DollarSign, Calendar, FileText, CreditCard, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { type RendererWithAllPagesProps, type BudgetItem, type Payment } from "./types";
import { formatCurrency, BUDGET_CATEGORIES, UpgradePrompt, UPGRADE_SUGGESTIONS, RelatedTemplates } from "./shared";
import { useUserPlan } from "../context";
import { Contact } from "lucide-react";

export function BudgetRenderer({ page, fields, updateField, allPages }: RendererWithAllPagesProps) {
  const { isFree } = useUserPlan();
  const rawItems = fields.items;
  const items: BudgetItem[] = Array.isArray(rawItems) ? rawItems : [];
  
  const totalBudget = parseFloat((fields.totalBudget as string) || "0") || 0;
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentItemIndex, setPaymentItemIndex] = useState<number | null>(null);
  const [newPayment, setNewPayment] = useState<Partial<Payment>>({
    amount: "",
    date: new Date().toISOString().split('T')[0],
    method: "",
    notes: "",
  });

  const generateId = () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const totalCost = items.reduce((sum, item) => sum + (parseFloat(item.totalCost || "0") || 0), 0);
  const totalPaid = items.reduce((sum, item) => sum + (parseFloat(item.amountPaid || "0") || 0), 0);
  const totalRemaining = totalCost - totalPaid;
  const budgetRemaining = totalBudget - totalCost;

  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const upcomingPayments = items.filter(item => {
    const depositDue = item.depositDueDate ? new Date(item.depositDueDate) : null;
    const finalDue = item.finalPaymentDueDate ? new Date(item.finalPaymentDueDate) : null;
    const itemPaid = parseFloat(item.amountPaid || "0") || 0;
    const itemTotal = parseFloat(item.totalCost || "0") || 0;
    if (itemPaid >= itemTotal) return false;
    return (depositDue && depositDue >= today && depositDue <= thirtyDaysFromNow) ||
           (finalDue && finalDue >= today && finalDue <= thirtyDaysFromNow);
  });

  const categoryTotals = items.reduce((acc, item) => {
    const cat = item.category || "Other";
    const cost = parseFloat(item.totalCost || "0") || 0;
    acc[cat] = (acc[cat] || 0) + cost;
    return acc;
  }, {} as Record<string, number>);

  const addItem = () => {
    const newItem: BudgetItem = {
      id: generateId(),
      category: "",
      vendor: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      totalCost: "",
      amountPaid: "",
      notes: "",
      payments: [],
      contractStatus: "none",
      depositDueDate: "",
      finalPaymentDueDate: "",
    };
    updateField("items", [...items, newItem]);
    setExpandedItem(newItem.id);
  };

  const updateItem = (index: number, key: string, value: unknown) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    updateField("items", updated);
  };

  const removeItem = (index: number) => {
    updateField("items", items.filter((_, i) => i !== index));
  };

  const openPaymentDialog = (index: number) => {
    setPaymentItemIndex(index);
    setNewPayment({
      amount: "",
      date: new Date().toISOString().split('T')[0],
      method: "",
      notes: "",
    });
    setShowPaymentDialog(true);
  };

  const addPayment = () => {
    if (paymentItemIndex === null || !newPayment.amount) return;
    const item = items[paymentItemIndex];
    const payment: Payment = {
      id: generateId(),
      amount: newPayment.amount || "",
      date: newPayment.date || "",
      method: newPayment.method || "",
      notes: newPayment.notes || "",
    };
    const existingPayments = item.payments || [];
    const totalPayments = existingPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const newTotal = totalPayments + (parseFloat(payment.amount) || 0);
    updateItem(paymentItemIndex, "payments", [...existingPayments, payment]);
    updateItem(paymentItemIndex, "amountPaid", newTotal.toString());
    setShowPaymentDialog(false);
    setPaymentItemIndex(null);
  };

  const removePayment = (itemIndex: number, paymentId: string) => {
    const item = items[itemIndex];
    const updatedPayments = (item.payments || []).filter(p => p.id !== paymentId);
    const newTotal = updatedPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    updateItem(itemIndex, "payments", updatedPayments);
    updateItem(itemIndex, "amountPaid", newTotal.toString());
  };

  const getContractStatusColor = (status: string) => {
    switch (status) {
      case "signed": return "text-green-600 bg-green-50 border-green-200";
      case "pending": return "text-amber-600 bg-amber-50 border-amber-200";
      case "completed": return "text-blue-600 bg-blue-50 border-blue-200";
      default: return "text-warm-400 bg-warm-50 border-warm-200";
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white shadow-lg p-4 sm:p-6 md:p-12">
        {/* Page Header */}
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-serif font-light tracking-wide">
            {page.title}
          </h2>
          <div className="w-10 h-px bg-warm-400 mx-auto mt-4" />
        </div>

        {/* Budget Summary - Mobile: 2x2 grid, Desktop: 4 columns */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8 p-4 md:p-6 bg-warm-50 border border-warm-200 rounded-lg">
          <div className="text-center">
            <p className="text-[10px] md:text-xs tracking-wider uppercase text-warm-500 mb-1">Budget</p>
            <Input
              type="number"
              value={(fields.totalBudget as string) || ""}
              onChange={(e) => updateField("totalBudget", e.target.value)}
              placeholder="0"
              className="text-center text-base md:text-lg font-light"
            />
          </div>
          <div className="text-center">
            <p className="text-[10px] md:text-xs tracking-wider uppercase text-warm-500 mb-1">Total Cost</p>
            <p className="text-xl md:text-2xl font-light text-warm-700 py-2">{formatCurrency(totalCost)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] md:text-xs tracking-wider uppercase text-warm-500 mb-1">Paid</p>
            <p className="text-xl md:text-2xl font-light text-green-600 py-2">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] md:text-xs tracking-wider uppercase text-warm-500 mb-1">Owed</p>
            <p className={`text-xl md:text-2xl font-light py-2 ${totalRemaining > 0 ? "text-amber-600" : "text-green-600"}`}>
              {formatCurrency(totalRemaining)}
            </p>
          </div>
        </div>

        {/* Budget Progress */}
        {totalBudget > 0 && (
          <div className="mb-6 md:mb-8 p-3 md:p-4 border border-warm-200 bg-warm-50/50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs md:text-sm text-warm-600">Budget Progress</span>
              <span className={`text-xs md:text-sm font-medium ${budgetRemaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                {budgetRemaining >= 0 
                  ? `${formatCurrency(budgetRemaining)} under` 
                  : `${formatCurrency(Math.abs(budgetRemaining))} over`
                }
              </span>
            </div>
            <div className="h-2 bg-warm-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${totalCost <= totalBudget ? "bg-green-500" : "bg-red-500"}`}
                style={{ width: `${Math.min((totalCost / totalBudget) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Upcoming Payments Alert */}
        {upcomingPayments.length > 0 && (
          <div className="mb-6 md:mb-8 p-3 md:p-4 border border-amber-200 bg-amber-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
              <h3 className="text-sm md:text-base font-medium text-amber-800">Upcoming Payments</h3>
            </div>
            <div className="space-y-2">
              {upcomingPayments.slice(0, 3).map((item, idx) => {
                const remaining = (parseFloat(item.totalCost || "0") || 0) - (parseFloat(item.amountPaid || "0") || 0);
                const dueDate = item.depositDueDate || item.finalPaymentDueDate;
                return (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-amber-700 truncate flex-1 mr-2">{item.vendor || item.category}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-amber-600 font-medium">{formatCurrency(remaining)}</span>
                      {dueDate && (
                        <span className="text-amber-500 text-xs hidden sm:inline">
                          {new Date(dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Breakdown - Collapsible on mobile */}
        {Object.keys(categoryTotals).length > 0 && (
          <details className="mb-6 md:mb-8 border border-warm-200 rounded-lg overflow-hidden">
            <summary className="p-3 md:p-4 bg-warm-50 cursor-pointer text-sm font-medium text-warm-600 flex items-center justify-between">
              <span>Spending by Category</span>
              <ChevronDown className="w-4 h-4 text-warm-400" />
            </summary>
            <div className="p-3 md:p-4 space-y-2">
              {Object.entries(categoryTotals)
                .sort(([,a], [,b]) => b - a)
                .map(([category, amount]) => {
                  const percentage = totalCost > 0 ? (amount / totalCost) * 100 : 0;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-warm-600 truncate">{category}</span>
                        <span className="text-warm-500 ml-2">{formatCurrency(amount)}</span>
                      </div>
                      <div className="h-1.5 bg-warm-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-warm-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </details>
        )}

        {/* Upgrade Prompt */}
        {isFree && items.length > 0 && (
          <UpgradePrompt
            variant="banner"
            title={UPGRADE_SUGGESTIONS.vendorContacts.title}
            description={UPGRADE_SUGGESTIONS.vendorContacts.description}
            featureName={UPGRADE_SUGGESTIONS.vendorContacts.featureName}
            icon={<Contact className="w-5 h-5 text-purple-600" />}
          />
        )}

        {/* Add Item Button */}
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <Label className="text-base">Vendors & Expenses</Label>
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="w-4 h-4 mr-1" />
            Add Vendor
          </Button>
        </div>

        {/* Items List - Card-based for all screen sizes */}
        {items.length > 0 ? (
          <div className="space-y-3 md:space-y-4">
            {items.map((item, index) => {
              const itemTotalCost = parseFloat(item.totalCost || "0") || 0;
              const itemAmountPaid = parseFloat(item.amountPaid || "0") || 0;
              const itemRemaining = itemTotalCost - itemAmountPaid;
              const isExpanded = expandedItem === item.id;
              const paymentPercentage = itemTotalCost > 0 ? (itemAmountPaid / itemTotalCost) * 100 : 0;

              return (
                <div
                  key={item.id || index}
                  className="border border-warm-200 rounded-lg overflow-hidden bg-white"
                >
                  {/* Card Header */}
                  <button
                    onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded border ${getContractStatusColor(item.contractStatus || "none")}`}>
                            {item.category || "No Category"}
                          </span>
                        </div>
                        <p className="font-medium text-warm-800 truncate">
                          {item.vendor || "Unnamed Vendor"}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-sm">
                          <span className="text-warm-500">{formatCurrency(itemTotalCost)}</span>
                          <span className={itemRemaining > 0 ? "text-amber-600" : "text-green-600"}>
                            {itemRemaining > 0 ? `${formatCurrency(itemRemaining)} due` : "Paid"}
                          </span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-warm-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-warm-400 flex-shrink-0" />
                      )}
                    </div>
                    
                    {/* Payment Progress */}
                    {itemTotalCost > 0 && (
                      <div className="mt-3 h-1.5 bg-warm-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${paymentPercentage >= 100 ? "bg-green-500" : "bg-amber-400"}`}
                          style={{ width: `${Math.min(paymentPercentage, 100)}%` }}
                        />
                      </div>
                    )}
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4 border-t border-warm-100">
                      <div className="pt-4 space-y-3">
                        {/* Basic Info */}
                        <div>
                          <Label className="text-xs text-warm-500">Category</Label>
                          <select
                            value={item.category || ""}
                            onChange={(e) => updateItem(index, "category", e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-warm-300 rounded-lg text-sm focus:outline-none focus:border-warm-500"
                          >
                            <option value="">Select category...</option>
                            {BUDGET_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-warm-500">Vendor Name</Label>
                          <Input
                            value={item.vendor || ""}
                            onChange={(e) => updateItem(index, "vendor", e.target.value)}
                            placeholder="Vendor name"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-warm-500">Total Cost</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
                              <Input
                                type="number"
                                value={item.totalCost || ""}
                                onChange={(e) => updateItem(index, "totalCost", e.target.value)}
                                placeholder="0"
                                className="pl-8"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-warm-500">Contract Status</Label>
                            <select
                              value={item.contractStatus || "none"}
                              onChange={(e) => updateItem(index, "contractStatus", e.target.value)}
                              className="w-full mt-1 px-3 py-2 border border-warm-300 rounded-lg text-sm"
                            >
                              <option value="none">No Contract</option>
                              <option value="pending">Pending</option>
                              <option value="signed">Signed</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="pt-3 border-t border-warm-100">
                          <p className="text-xs font-medium text-warm-500 mb-2">Contact Info</p>
                          <div className="space-y-2">
                            <Input
                              value={item.contactName || ""}
                              onChange={(e) => updateItem(index, "contactName", e.target.value)}
                              placeholder="Contact name"
                            />
                            <Input
                              type="email"
                              value={item.contactEmail || ""}
                              onChange={(e) => updateItem(index, "contactEmail", e.target.value)}
                              placeholder="Email"
                            />
                            <Input
                              type="tel"
                              value={item.contactPhone || ""}
                              onChange={(e) => updateItem(index, "contactPhone", e.target.value)}
                              placeholder="Phone"
                            />
                          </div>
                        </div>

                        {/* Payment Schedule */}
                        <div className="pt-3 border-t border-warm-100">
                          <p className="text-xs font-medium text-warm-500 mb-2">Payment Schedule</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs text-warm-400">Deposit Due</Label>
                              <Input
                                type="date"
                                value={item.depositDueDate || ""}
                                onChange={(e) => updateItem(index, "depositDueDate", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-warm-400">Final Due</Label>
                              <Input
                                type="date"
                                value={item.finalPaymentDueDate || ""}
                                onChange={(e) => updateItem(index, "finalPaymentDueDate", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <Label className="text-xs text-warm-500">Notes</Label>
                          <Input
                            value={item.notes || ""}
                            onChange={(e) => updateItem(index, "notes", e.target.value)}
                            placeholder="Any notes..."
                          />
                        </div>

                        {/* Payment History */}
                        <div className="pt-3 border-t border-warm-100">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-warm-500">Payment History</p>
                            <Button variant="outline" size="sm" onClick={() => openPaymentDialog(index)}>
                              <CreditCard className="w-3 h-3 mr-1" />
                              Log Payment
                            </Button>
                          </div>
                          
                          {(item.payments || []).length > 0 ? (
                            <div className="space-y-2">
                              {(item.payments || []).map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between p-2 bg-warm-50 rounded text-sm">
                                  <div>
                                    <span className="font-medium text-green-600">{formatCurrency(parseFloat(payment.amount) || 0)}</span>
                                    {payment.date && (
                                      <span className="text-warm-400 ml-2 text-xs">
                                        {new Date(payment.date).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => removePayment(index, payment.id)}
                                    className="p-1 text-warm-400 hover:text-red-500"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-warm-400 italic">No payments logged</p>
                          )}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => removeItem(index)}
                        className="w-full py-2 text-sm text-red-500 hover:text-red-600 transition-colors border-t border-warm-100 mt-4"
                      >
                        Remove Vendor
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 md:py-12">
            <p className="text-sm text-warm-400 italic mb-4">
              No vendors yet. Start tracking your wedding expenses.
            </p>
            <Button variant="outline" onClick={addItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Vendor
            </Button>
          </div>
        )}

        {/* Related Templates */}
        <RelatedTemplates 
          templateIds={["vendor-contacts", "task-board", "honeymoon-planner"]} 
          allPages={allPages}
          title="Related"
        />
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-500" />
              Log Payment
            </DialogTitle>
            <DialogDescription>
              {paymentItemIndex !== null && items[paymentItemIndex] && (
                <>Record a payment for {items[paymentItemIndex].vendor || items[paymentItemIndex].category}</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div>
              <Label>Amount</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
                <Input
                  type="number"
                  value={newPayment.amount || ""}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  placeholder="0.00"
                  className="pl-8"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={newPayment.date || ""}
                onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Payment Method</Label>
              <select
                value={newPayment.method || ""}
                onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-warm-300 rounded-lg text-sm"
              >
                <option value="">Select method...</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Check">Check</option>
                <option value="Cash">Cash</option>
                <option value="Venmo">Venmo</option>
                <option value="Zelle">Zelle</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <Label>Notes (optional)</Label>
              <Input
                value={newPayment.notes || ""}
                onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                placeholder="e.g., Deposit"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={addPayment}
              disabled={!newPayment.amount}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Log Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
