"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Plus, Trash2, Users, Circle, Square, RectangleHorizontal,
  UserPlus, Search, Check, X, ChevronDown, ChevronUp,
  Utensils, AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { type RendererWithAllPagesProps, type Table, type SeatedGuest, type GuestListGuest } from "./types";

const TABLE_SHAPES = [
  { id: "round", label: "Round", icon: Circle, defaultCapacity: 8 },
  { id: "rectangle", label: "Rect", icon: RectangleHorizontal, defaultCapacity: 10 },
  { id: "square", label: "Square", icon: Square, defaultCapacity: 8 },
];

export function SeatingChartRenderer({ page, fields, updateField, allPages }: RendererWithAllPagesProps) {
  // Ensure tables is always an array
  const rawTables = fields.tables;
  const tables: Table[] = Array.isArray(rawTables) ? rawTables : [];
  
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [guestSearch, setGuestSearch] = useState("");
  const [showUnseated, setShowUnseated] = useState(false);

  // Get guests from guest list
  const guestListPage = allPages.find(p => p.templateId === "guest-list");
  const guestListFields = (guestListPage?.fields || {}) as Record<string, unknown>;
  const rawGuests = guestListFields.guests;
  const guestListGuests: GuestListGuest[] = Array.isArray(rawGuests) ? rawGuests : [];
  
  // Only show confirmed guests - with defensive checks
  const confirmedGuests = useMemo(() => {
    return guestListGuests.filter(g => g && g.rsvp && g.name);
  }, [guestListGuests]);

  // Generate unique ID
  const generateId = () => `table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const generateGuestId = () => `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Get all seated guest names
  const seatedGuestNames = useMemo(() => {
    const names = new Set<string>();
    tables.forEach(table => {
      if (table && Array.isArray(table.guests)) {
        table.guests.forEach(guest => {
          if (guest && guest.name) names.add(guest.name.toLowerCase());
        });
      }
    });
    return names;
  }, [tables]);

  // Find unseated guests
  const unseatedGuests = useMemo(() => {
    return confirmedGuests.filter(g => 
      g && g.name && !seatedGuestNames.has(g.name.toLowerCase())
    );
  }, [confirmedGuests, seatedGuestNames]);

  // Filter guests for search
  const filteredGuests = useMemo(() => {
    if (!guestSearch) return unseatedGuests;
    const search = guestSearch.toLowerCase();
    return unseatedGuests.filter(g => 
      g && g.name && g.name.toLowerCase().includes(search)
    );
  }, [unseatedGuests, guestSearch]);

  // Stats - with defensive checks
  const totalSeats = tables.reduce((sum, t) => sum + (t?.capacity || 0), 0);
  const totalSeated = tables.reduce((sum, t) => sum + (Array.isArray(t?.guests) ? t.guests.length : 0), 0);
  const totalTables = tables.length;

  const addTable = (shape: Table["shape"] = "round") => {
    const shapeInfo = TABLE_SHAPES.find(s => s.id === shape) || TABLE_SHAPES[0];
    const tableNumber = tables.length + 1;
    
    const newTable: Table = {
      id: generateId(),
      name: `Table ${tableNumber}`,
      shape,
      capacity: shapeInfo.defaultCapacity,
      guests: [],
    };
    updateField("tables", [...tables, newTable]);
    setSelectedTable(newTable.id);
  };

  const updateTable = (tableId: string, key: string, value: unknown) => {
    const updated = tables.map(t => 
      t.id === tableId ? { ...t, [key]: value } : t
    );
    updateField("tables", updated);
  };

  const removeTable = (tableId: string) => {
    updateField("tables", tables.filter(t => t.id !== tableId));
    if (selectedTable === tableId) setSelectedTable(null);
  };

  const addGuestToTable = (tableId: string, guest: GuestListGuest | { name: string }) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    if ((table.guests?.length || 0) >= table.capacity) {
      toast.error("Table is at capacity!");
      return;
    }

    const newGuest: SeatedGuest = {
      id: generateGuestId(),
      name: guest.name,
      meal: "meal" in guest ? guest.meal : undefined,
      dietaryRestrictions: "dietaryRestrictions" in guest ? guest.dietaryRestrictions : undefined,
    };

    updateTable(tableId, "guests", [...(table.guests || []), newGuest]);
    toast.success(`Added ${guest.name} to ${table.name}`);
    setGuestSearch("");
  };

  const removeGuestFromTable = (tableId: string, guestId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    updateTable(tableId, "guests", table.guests?.filter(g => g.id !== guestId) || []);
  };

  const getShapeIcon = (shape: Table["shape"]) => {
    const shapeInfo = TABLE_SHAPES.find(s => s.id === shape);
    return shapeInfo?.icon || Circle;
  };

  const selectedTableData = tables.find(t => t.id === selectedTable);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-0">
      <div className="bg-white shadow-lg p-4 md:p-8 lg:p-12">
        {/* Page Header */}
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-serif font-light tracking-wide">
            {page.title}
          </h2>
          <div className="w-10 h-px bg-warm-400 mx-auto mt-3 md:mt-4" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
          <div className="text-center p-2 md:p-4 bg-warm-50 border border-warm-200 rounded-lg">
            <p className="text-lg md:text-2xl font-light text-warm-700">{totalTables}</p>
            <p className="text-[9px] md:text-xs tracking-wider uppercase text-warm-500">Tables</p>
          </div>
          <div className="text-center p-2 md:p-4 bg-warm-50 border border-warm-200 rounded-lg">
            <p className="text-lg md:text-2xl font-light text-warm-700">{totalSeats}</p>
            <p className="text-[9px] md:text-xs tracking-wider uppercase text-warm-500">Seats</p>
          </div>
          <div className="text-center p-2 md:p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-lg md:text-2xl font-light text-green-600">{totalSeated}</p>
            <p className="text-[9px] md:text-xs tracking-wider uppercase text-green-600">Seated</p>
          </div>
          <div className="text-center p-2 md:p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-lg md:text-2xl font-light text-amber-600">{unseatedGuests.length}</p>
            <p className="text-[9px] md:text-xs tracking-wider uppercase text-amber-600">Unseated</p>
          </div>
        </div>

        {/* Unseated Alert */}
        {unseatedGuests.length > 0 && (
          <div className="mb-6 md:mb-8 p-3 md:p-4 border border-amber-200 bg-amber-50 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-amber-800 text-sm md:text-base">
                    {unseatedGuests.length} Guest{unseatedGuests.length !== 1 ? "s" : ""} Need Seats
                  </h3>
                  <p className="text-xs md:text-sm text-amber-600 truncate max-w-[200px] sm:max-w-none">
                    {unseatedGuests.slice(0, 3).map(g => g.name).join(", ")}
                    {unseatedGuests.length > 3 && ` +${unseatedGuests.length - 3}`}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowUnseated(true)}
                className="border-amber-300 text-amber-700 hover:bg-amber-100 w-full sm:w-auto"
                size="sm"
              >
                View All
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
          {/* Tables Grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <Label className="text-sm md:text-base">Tables</Label>
              <div className="flex gap-1 md:gap-2">
                {TABLE_SHAPES.map(shape => {
                  const Icon = shape.icon;
                  return (
                    <Button
                      key={shape.id}
                      variant="outline"
                      size="sm"
                      onClick={() => addTable(shape.id as Table["shape"])}
                      title={`Add ${shape.label} Table`}
                      className="px-2 md:px-3"
                    >
                      <Icon className="w-3 h-3 md:w-4 md:h-4 md:mr-1" />
                      <Plus className="w-2 h-2 md:w-3 md:h-3" />
                    </Button>
                  );
                })}
              </div>
            </div>

            {tables.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {tables.map(table => {
                  const Icon = getShapeIcon(table.shape);
                  const isSelected = selectedTable === table.id;
                  const guestCount = table.guests?.length || 0;
                  const isFull = guestCount >= table.capacity;

                  return (
                    <div
                      key={table.id}
                      onClick={() => setSelectedTable(table.id)}
                      className={`p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? "border-warm-500 bg-warm-50" 
                          : "border-warm-200 hover:border-warm-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2 md:mb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Icon className="w-4 h-4 md:w-5 md:h-5 text-warm-400 flex-shrink-0" />
                          <Input
                            value={table.name}
                            onChange={(e) => updateTable(table.id, "name", e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="font-medium border-0 px-0 h-6 md:h-7 focus:ring-0 bg-transparent text-sm md:text-base"
                          />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTable(table.id);
                          }}
                          className="p-1 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      </div>

                      {/* Capacity */}
                      <div className="flex items-center gap-2 mb-2 md:mb-3">
                        <span className={`text-xs md:text-sm ${isFull ? "text-green-600" : "text-warm-500"}`}>
                          {guestCount} / {table.capacity}
                        </span>
                        <div className="flex-1 h-1 md:h-1.5 bg-warm-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${isFull ? "bg-green-500" : "bg-warm-400"}`}
                            style={{ width: `${(guestCount / table.capacity) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Guest List Preview */}
                      {table.guests && table.guests.length > 0 ? (
                        <div className="space-y-0.5 md:space-y-1">
                          {table.guests.slice(0, 3).map(guest => (
                            <div key={guest.id} className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-warm-600">
                              <Users className="w-2.5 h-2.5 md:w-3 md:h-3 text-warm-400 flex-shrink-0" />
                              <span className="truncate">{guest.name}</span>
                            </div>
                          ))}
                          {table.guests.length > 3 && (
                            <p className="text-[10px] md:text-xs text-warm-400 pl-4 md:pl-5">
                              +{table.guests.length - 3} more
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs md:text-sm text-warm-400 italic">No guests</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 md:py-12 bg-warm-50 rounded-lg border-2 border-dashed border-warm-200">
                <Circle className="w-10 h-10 md:w-12 md:h-12 mx-auto text-warm-300 mb-3 md:mb-4" />
                <p className="text-warm-500 mb-2 text-sm md:text-base">No tables yet</p>
                <p className="text-xs md:text-sm text-warm-400 mb-4">
                  Add tables to start arranging seating
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {TABLE_SHAPES.map(shape => {
                    const Icon = shape.icon;
                    return (
                      <Button
                        key={shape.id}
                        variant="outline"
                        size="sm"
                        onClick={() => addTable(shape.id as Table["shape"])}
                      >
                        <Icon className="w-4 h-4 mr-1 md:mr-2" />
                        <span className="text-xs md:text-sm">{shape.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Selected Table Details */}
          <div className="lg:col-span-1">
            {selectedTableData ? (
              <div className="border border-warm-200 rounded-lg p-3 md:p-4 sticky top-4">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="font-medium text-warm-700 text-sm md:text-base">{selectedTableData.name}</h3>
                  <button
                    onClick={() => setSelectedTable(null)}
                    className="p-1 hover:bg-warm-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Table Settings */}
                <div className="space-y-2 md:space-y-3 mb-3 md:mb-4 pb-3 md:pb-4 border-b border-warm-200">
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] md:text-xs w-14 md:w-16">Shape</Label>
                    <select
                      value={selectedTableData.shape}
                      onChange={(e) => updateTable(selectedTableData.id, "shape", e.target.value)}
                      className="flex-1 px-2 py-1 border border-warm-300 rounded text-xs md:text-sm"
                    >
                      {TABLE_SHAPES.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] md:text-xs w-14 md:w-16">Capacity</Label>
                    <Input
                      type="number"
                      value={selectedTableData.capacity}
                      onChange={(e) => updateTable(selectedTableData.id, "capacity", parseInt(e.target.value) || 0)}
                      className="flex-1 text-xs md:text-sm"
                      min={1}
                      max={20}
                    />
                  </div>
                </div>

                {/* Guests at Table */}
                <div className="mb-3 md:mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-[10px] md:text-xs">Guests ({selectedTableData.guests?.length || 0}/{selectedTableData.capacity})</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddGuest(true)}
                      disabled={(selectedTableData.guests?.length || 0) >= selectedTableData.capacity}
                      className="h-7 text-xs"
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>

                  {selectedTableData.guests && selectedTableData.guests.length > 0 ? (
                    <div className="space-y-1 md:space-y-2 max-h-48 md:max-h-64 overflow-y-auto">
                      {selectedTableData.guests.map((guest, idx) => (
                        <div
                          key={guest.id}
                          className="flex items-center justify-between p-1.5 md:p-2 bg-warm-50 rounded group"
                        >
                          <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
                            <span className="w-4 h-4 md:w-5 md:h-5 bg-warm-200 rounded-full flex items-center justify-center text-[10px] md:text-xs text-warm-600 flex-shrink-0">
                              {idx + 1}
                            </span>
                            <p className="text-xs md:text-sm font-medium text-warm-700 truncate">{guest.name}</p>
                          </div>
                          <button
                            onClick={() => removeGuestFromTable(selectedTableData.id, guest.id)}
                            className="p-0.5 md:p-1 md:opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs md:text-sm text-warm-400 italic text-center py-3 md:py-4">
                      No guests at this table
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-warm-200 rounded-lg p-6 md:p-8 text-center">
                <Users className="w-6 h-6 md:w-8 md:h-8 mx-auto text-warm-300 mb-2 md:mb-3" />
                <p className="text-warm-500 text-sm md:text-base">Select a table</p>
                <p className="text-xs md:text-sm text-warm-400">to view and edit guests</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Guest Dialog */}
      <Dialog open={showAddGuest} onOpenChange={setShowAddGuest}>
        <DialogContent className="max-w-md mx-4 md:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">Add Guest to {selectedTableData?.name}</DialogTitle>
            <DialogDescription className="text-sm">
              Search for a guest or add a custom name
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
              <Input
                value={guestSearch}
                onChange={(e) => setGuestSearch(e.target.value)}
                placeholder="Search guests..."
                className="pl-9 text-sm"
                autoFocus
              />
            </div>

            {filteredGuests.length > 0 ? (
              <div className="space-y-2 max-h-48 md:max-h-64 overflow-y-auto">
                {filteredGuests.map((guest, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (selectedTableData) {
                        addGuestToTable(selectedTableData.id, guest);
                      }
                    }}
                    className="w-full flex items-center justify-between p-2 md:p-3 border border-warm-200 rounded hover:bg-warm-50 transition-colors text-left"
                  >
                    <p className="font-medium text-warm-700 text-sm truncate">{guest.name}</p>
                    <Plus className="w-4 h-4 text-warm-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            ) : guestSearch ? (
              <div className="text-center py-4">
                <p className="text-warm-500 mb-3 text-sm">No matching guests</p>
                <Button
                  size="sm"
                  onClick={() => {
                    if (selectedTableData) {
                      addGuestToTable(selectedTableData.id, { name: guestSearch });
                      setShowAddGuest(false);
                    }
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add &quot;{guestSearch}&quot;
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 md:py-8">
                <Check className="w-6 h-6 md:w-8 md:h-8 mx-auto text-green-500 mb-3" />
                <p className="text-warm-500 text-sm">All confirmed guests are seated!</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Unseated Guests Dialog */}
      <Dialog open={showUnseated} onOpenChange={setShowUnseated}>
        <DialogContent className="max-w-md mx-4 md:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">Unseated Guests</DialogTitle>
            <DialogDescription className="text-sm">
              {unseatedGuests.length} guest{unseatedGuests.length !== 1 ? "s" : ""} need seats
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2 max-h-64 md:max-h-96 overflow-y-auto">
            {unseatedGuests.map((guest, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 md:p-3 border border-warm-200 rounded"
              >
                <p className="font-medium text-warm-700 text-sm truncate flex-1">{guest.name}</p>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addGuestToTable(e.target.value, guest);
                      e.target.value = "";
                    }
                  }}
                  className="px-2 py-1 border border-warm-300 rounded text-xs md:text-sm ml-2"
                  defaultValue=""
                >
                  <option value="">Assign...</option>
                  {tables
                    .filter(t => (t.guests?.length || 0) < t.capacity)
                    .map(table => (
                      <option key={table.id} value={table.id}>
                        {table.name} ({table.guests?.length || 0}/{table.capacity})
                      </option>
                    ))}
                </select>
              </div>
            ))}
          </div>

          <Button variant="outline" onClick={() => setShowUnseated(false)} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
