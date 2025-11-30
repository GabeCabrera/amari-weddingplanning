"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Plus, Trash2, Phone, Mail, Globe, MapPin, FileText, 
  CheckCircle2, Clock, AlertCircle, ExternalLink, Copy,
  Building2, User, Calendar, DollarSign, ChevronDown, ChevronUp,
  Download
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { type RendererWithAllPagesProps, type Vendor, type BudgetItem } from "./types";
import { formatCurrency, BUDGET_CATEGORIES } from "./shared";

export function VendorContactsRenderer({ page, fields, updateField, allPages }: RendererWithAllPagesProps) {
  // Ensure vendors is always an array
  const rawVendors = fields.vendors;
  const vendors: Vendor[] = Array.isArray(rawVendors) ? rawVendors : [];
  
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Get budget page data for importing vendors
  const budgetPage = allPages.find(p => p.templateId === "budget");
  const budgetFields = (budgetPage?.fields || {}) as Record<string, unknown>;
  const rawBudgetItems = budgetFields.items;
  const budgetItems: BudgetItem[] = Array.isArray(rawBudgetItems) ? rawBudgetItems : [];

  // Find vendors from budget that aren't already in vendor contacts
  const importableVendors = budgetItems.filter(item => {
    if (!item.vendor) return false;
    return !vendors.some(v => 
      v.company?.toLowerCase() === item.vendor?.toLowerCase() &&
      v.category === item.category
    );
  });

  // Generate unique ID
  const generateId = () => `vendor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addVendor = () => {
    const newVendor: Vendor = {
      id: generateId(),
      category: "",
      company: "",
      contactName: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      contractStatus: "none",
      depositPaid: false,
      notes: "",
    };
    updateField("vendors", [...vendors, newVendor]);
    setExpandedVendor(newVendor.id);
  };

  const importFromBudget = (budgetItem: BudgetItem) => {
    const newVendor: Vendor = {
      id: generateId(),
      category: budgetItem.category || "",
      company: budgetItem.vendor || "",
      contactName: budgetItem.contactName || "",
      email: budgetItem.contactEmail || "",
      phone: budgetItem.contactPhone || "",
      website: "",
      address: "",
      contractStatus: budgetItem.contractStatus || "none",
      depositPaid: (parseFloat(budgetItem.amountPaid || "0") || 0) > 0,
      notes: budgetItem.notes || "",
      totalCost: parseFloat(budgetItem.totalCost || "0") || 0,
      amountPaid: parseFloat(budgetItem.amountPaid || "0") || 0,
    };
    updateField("vendors", [...vendors, newVendor]);
    toast.success(`Imported ${budgetItem.vendor || budgetItem.category}`);
  };

  const importAllFromBudget = () => {
    const newVendors = importableVendors.map(item => ({
      id: generateId(),
      category: item.category || "",
      company: item.vendor || "",
      contactName: item.contactName || "",
      email: item.contactEmail || "",
      phone: item.contactPhone || "",
      website: "",
      address: "",
      contractStatus: item.contractStatus || "none",
      depositPaid: (parseFloat(item.amountPaid || "0") || 0) > 0,
      notes: item.notes || "",
      totalCost: parseFloat(item.totalCost || "0") || 0,
      amountPaid: parseFloat(item.amountPaid || "0") || 0,
    }));
    updateField("vendors", [...vendors, ...newVendors]);
    toast.success(`Imported ${newVendors.length} vendors`);
    setShowImportDialog(false);
  };

  const updateVendor = (index: number, key: string, value: unknown) => {
    const updated = [...vendors];
    updated[index] = { ...updated[index], [key]: value };
    updateField("vendors", updated);
  };

  const removeVendor = (index: number) => {
    updateField("vendors", vendors.filter((_, i) => i !== index));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const getContractStatusColor = (status: string) => {
    switch (status) {
      case "signed": return "text-green-600 bg-green-50 border-green-200";
      case "pending": return "text-amber-600 bg-amber-50 border-amber-200";
      case "completed": return "text-blue-600 bg-blue-50 border-blue-200";
      default: return "text-warm-400 bg-warm-50 border-warm-200";
    }
  };

  const getContractStatusIcon = (status: string) => {
    switch (status) {
      case "signed": return <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />;
      case "pending": return <Clock className="w-3 h-3 md:w-4 md:h-4" />;
      case "completed": return <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />;
      default: return <FileText className="w-3 h-3 md:w-4 md:h-4" />;
    }
  };

  // Group vendors by category
  const vendorsByCategory = vendors.reduce((acc, vendor) => {
    const cat = vendor.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(vendor);
    return acc;
  }, {} as Record<string, Vendor[]>);

  // Stats
  const totalVendors = vendors.length;
  const signedContracts = vendors.filter(v => v.contractStatus === "signed" || v.contractStatus === "completed").length;
  const pendingContracts = vendors.filter(v => v.contractStatus === "pending").length;

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
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
          <div className="text-center p-3 md:p-4 bg-warm-50 border border-warm-200 rounded-lg">
            <p className="text-xl md:text-2xl font-light text-warm-700">{totalVendors}</p>
            <p className="text-[10px] md:text-xs tracking-wider uppercase text-warm-500">Vendors</p>
          </div>
          <div className="text-center p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xl md:text-2xl font-light text-green-600">{signedContracts}</p>
            <p className="text-[10px] md:text-xs tracking-wider uppercase text-green-600">Signed</p>
          </div>
          <div className="text-center p-3 md:p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xl md:text-2xl font-light text-amber-600">{pendingContracts}</p>
            <p className="text-[10px] md:text-xs tracking-wider uppercase text-amber-600">Pending</p>
          </div>
        </div>

        {/* Import from Budget */}
        {importableVendors.length > 0 && (
          <div className="mb-6 md:mb-8 p-3 md:p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-800 text-sm md:text-base">Import from Budget</h3>
                  <p className="text-xs md:text-sm text-blue-600">
                    {importableVendors.length} vendor{importableVendors.length !== 1 ? "s" : ""} found
                  </p>
                </div>
              </div>
              <Button onClick={() => setShowImportDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto" size="sm">
                Import
              </Button>
            </div>
          </div>
        )}

        {/* Add Vendor Button */}
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <Label className="text-sm md:text-base">Your Vendors</Label>
          <Button variant="ghost" size="sm" onClick={addVendor}>
            <Plus className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Add Vendor</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* Vendors List */}
        {vendors.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(vendorsByCategory).map(([category, categoryVendors]) => (
              <div key={category}>
                <h3 className="text-xs md:text-sm font-medium text-warm-500 mb-2 md:mb-3 uppercase tracking-wider">
                  {category} ({categoryVendors.length})
                </h3>
                <div className="space-y-2 md:space-y-3">
                  {categoryVendors.map((vendor) => {
                    const index = vendors.findIndex(v => v.id === vendor.id);
                    const isExpanded = expandedVendor === vendor.id;

                    return (
                      <div
                        key={vendor.id}
                        className="border border-warm-200 rounded-lg overflow-hidden hover:border-warm-300 transition-colors"
                      >
                        {/* Main Row - Clickable Header */}
                        <button
                          onClick={() => setExpandedVendor(isExpanded ? null : vendor.id)}
                          className="w-full p-3 md:p-4 bg-white text-left"
                        >
                          <div className="flex items-center gap-3 md:gap-4">
                            {/* Icon */}
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-warm-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-4 h-4 md:w-5 md:h-5 text-warm-500" />
                            </div>

                            {/* Company Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-warm-800 text-sm md:text-base truncate">
                                {vendor.company || "Unnamed Vendor"}
                              </p>
                              <div className="flex items-center gap-2 md:gap-4 mt-0.5 text-xs md:text-sm text-warm-500">
                                {vendor.contactName && (
                                  <span className="flex items-center gap-1 truncate">
                                    <User className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{vendor.contactName}</span>
                                  </span>
                                )}
                                {vendor.phone && (
                                  <span className="hidden sm:flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {vendor.phone}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Contract Status Badge */}
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] md:text-xs ${getContractStatusColor(vendor.contractStatus)}`}>
                              {getContractStatusIcon(vendor.contractStatus)}
                              <span className="hidden sm:inline capitalize">
                                {vendor.contractStatus === "none" ? "No Contract" : vendor.contractStatus}
                              </span>
                            </div>

                            {/* Expand Icon */}
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-warm-400 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-warm-400 flex-shrink-0" />
                            )}
                          </div>
                        </button>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="p-3 md:p-4 bg-warm-50 border-t border-warm-200">
                            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                              {/* Contact Info */}
                              <div className="space-y-3">
                                <h4 className="text-xs md:text-sm font-medium text-warm-600">Contact Details</h4>
                                
                                <div className="space-y-2">
                                  <Label className="text-[10px] md:text-xs">Company Name</Label>
                                  <Input
                                    value={vendor.company || ""}
                                    onChange={(e) => updateVendor(index, "company", e.target.value)}
                                    placeholder="Company name"
                                    className="text-sm"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-[10px] md:text-xs">Category</Label>
                                  <select
                                    value={vendor.category || ""}
                                    onChange={(e) => updateVendor(index, "category", e.target.value)}
                                    className="w-full px-3 py-2 border border-warm-300 rounded text-sm focus:outline-none focus:border-warm-500 bg-white"
                                  >
                                    <option value="">Select category...</option>
                                    {BUDGET_CATEGORIES.map((cat) => (
                                      <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                  </select>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-[10px] md:text-xs">Contact Name</Label>
                                  <Input
                                    value={vendor.contactName || ""}
                                    onChange={(e) => updateVendor(index, "contactName", e.target.value)}
                                    placeholder="Primary contact"
                                    className="text-sm"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-[10px] md:text-xs">Email</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      value={vendor.email || ""}
                                      onChange={(e) => updateVendor(index, "email", e.target.value)}
                                      placeholder="email@example.com"
                                      type="email"
                                      className="text-sm flex-1"
                                    />
                                    {vendor.email && (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => copyToClipboard(vendor.email, "Email")}
                                        className="px-2"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-[10px] md:text-xs">Phone</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      value={vendor.phone || ""}
                                      onChange={(e) => updateVendor(index, "phone", e.target.value)}
                                      placeholder="(555) 123-4567"
                                      type="tel"
                                      className="text-sm flex-1"
                                    />
                                    {vendor.phone && (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => copyToClipboard(vendor.phone, "Phone")}
                                        className="px-2"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Additional Info */}
                              <div className="space-y-3">
                                <h4 className="text-xs md:text-sm font-medium text-warm-600">Additional Information</h4>

                                <div className="space-y-2">
                                  <Label className="text-[10px] md:text-xs">Website</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      value={vendor.website || ""}
                                      onChange={(e) => updateVendor(index, "website", e.target.value)}
                                      placeholder="https://..."
                                      className="text-sm flex-1"
                                    />
                                    {vendor.website && (
                                      <a href={vendor.website} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="sm" className="px-2">
                                          <ExternalLink className="w-3 h-3" />
                                        </Button>
                                      </a>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-[10px] md:text-xs">Address</Label>
                                  <Input
                                    value={vendor.address || ""}
                                    onChange={(e) => updateVendor(index, "address", e.target.value)}
                                    placeholder="Full address"
                                    className="text-sm"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-[10px] md:text-xs">Contract Status</Label>
                                  <select
                                    value={vendor.contractStatus || "none"}
                                    onChange={(e) => updateVendor(index, "contractStatus", e.target.value)}
                                    className="w-full px-3 py-2 border border-warm-300 rounded text-sm focus:outline-none focus:border-warm-500 bg-white"
                                  >
                                    <option value="none">No Contract</option>
                                    <option value="pending">Pending</option>
                                    <option value="signed">Signed</option>
                                    <option value="completed">Completed</option>
                                  </select>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-[10px] md:text-xs">Notes</Label>
                                  <Textarea
                                    value={vendor.notes || ""}
                                    onChange={(e) => updateVendor(index, "notes", e.target.value)}
                                    placeholder="Contract details, notes..."
                                    rows={3}
                                    className="text-sm"
                                  />
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                  <input
                                    type="checkbox"
                                    id={`deposit-${vendor.id}`}
                                    checked={vendor.depositPaid || false}
                                    onChange={(e) => updateVendor(index, "depositPaid", e.target.checked)}
                                    className="w-4 h-4 accent-green-500"
                                  />
                                  <Label htmlFor={`deposit-${vendor.id}`} className="text-xs md:text-sm cursor-pointer">
                                    Deposit paid
                                  </Label>
                                </div>
                              </div>
                            </div>

                            {/* Remove Button */}
                            <div className="mt-4 pt-4 border-t border-warm-200">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeVendor(index)}
                                className="w-full sm:w-auto text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove Vendor
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 md:py-12 bg-warm-50 rounded-lg">
            <Building2 className="w-10 h-10 md:w-12 md:h-12 mx-auto text-warm-300 mb-3 md:mb-4" />
            <p className="text-warm-500 mb-2 text-sm md:text-base">No vendors yet</p>
            <p className="text-xs md:text-sm text-warm-400 mb-4">
              {importableVendors.length > 0 
                ? "Import vendors from your budget or add them manually"
                : "Add your first vendor to get started"
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center">
              {importableVendors.length > 0 && (
                <Button onClick={() => setShowImportDialog(true)} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Import from Budget
                </Button>
              )}
              <Button onClick={addVendor} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Vendor
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-lg mx-4 md:mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
              <Download className="w-5 h-5 text-blue-500" />
              Import from Budget
            </DialogTitle>
            <DialogDescription className="text-sm">
              Select vendors to import from your budget tracker
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2 md:space-y-3">
            {importableVendors.map((item, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3 border border-warm-200 rounded-lg hover:bg-warm-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-warm-700 text-sm md:text-base truncate">{item.vendor || "Unnamed"}</p>
                  <p className="text-xs md:text-sm text-warm-500">{item.category}</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 ml-2">
                  {item.totalCost && (
                    <span className="text-xs md:text-sm text-warm-500 hidden sm:inline">
                      {formatCurrency(parseFloat(item.totalCost) || 0)}
                    </span>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => importFromBudget(item)}
                    className="text-xs"
                  >
                    Import
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 md:gap-3 pt-4 border-t border-warm-200">
            <Button variant="outline" onClick={() => setShowImportDialog(false)} className="flex-1 text-sm">
              Cancel
            </Button>
            <Button 
              onClick={importAllFromBudget}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              Import All ({importableVendors.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
