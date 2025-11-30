"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Calendar, MapPin, Clock, Users, DollarSign, Heart, Phone, Palette, CheckCircle2 } from "lucide-react";
import { type RendererWithAllPagesProps } from "./types";
import { formatCurrency, formatDate } from "./shared";

export function OverviewRenderer({ page, fields, updateField, allPages }: RendererWithAllPagesProps) {
  // Get data from other pages
  const coverPage = allPages.find(p => p.templateId === "cover");
  const budgetPage = allPages.find(p => p.templateId === "budget");
  const guestListPage = allPages.find(p => p.templateId === "guest-list");
  const weddingPartyPage = allPages.find(p => p.templateId === "wedding-party");
  const taskBoardPage = allPages.find(p => p.templateId === "task-board");

  // Extract data from cover page
  const coverFields = (coverPage?.fields || {}) as Record<string, unknown>;
  const weddingDate = coverFields.weddingDate as string;
  const coupleNames = coverFields.names as string;

  // Calculate days until wedding
  const daysUntil = weddingDate ? Math.ceil(
    (new Date(weddingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  ) : null;

  // Extract budget data
  const budgetFields = (budgetPage?.fields || {}) as Record<string, unknown>;
  const budgetItems = (budgetFields.items as Record<string, unknown>[]) || [];
  const totalBudget = parseFloat((budgetFields.totalBudget as string) || "0") || 0;
  const totalSpent = budgetItems.reduce((sum, item) => {
    return sum + (parseFloat((item.totalCost as string) || "0") || 0);
  }, 0);
  const totalPaid = budgetItems.reduce((sum, item) => {
    return sum + (parseFloat((item.amountPaid as string) || "0") || 0);
  }, 0);

  // Extract guest data
  const guestFields = (guestListPage?.fields || {}) as Record<string, unknown>;
  const guests = (guestFields.guests as Record<string, unknown>[]) || [];
  const totalGuests = guests.length;
  const confirmedGuests = guests.filter(g => g.rsvp === true).length;

  // Extract wedding party data
  const partyFields = (weddingPartyPage?.fields || {}) as Record<string, unknown>;
  const bridesmaids = (partyFields.bridesmaids as Record<string, unknown>[]) || [];
  const groomsmen = (partyFields.groomsmen as Record<string, unknown>[]) || [];
  const weddingPartySize = bridesmaids.length + groomsmen.length;

  // Extract task board data
  const taskBoardFields = (taskBoardPage?.fields || {}) as Record<string, unknown>;
  const boardTasks = (taskBoardFields.tasks as { id: string; title: string; status: string; assignee: string }[]) || [];
  const totalBoardTasks = boardTasks.length;
  const completedBoardTasks = boardTasks.filter(t => t.status === "done").length;
  const inProgressBoardTasks = boardTasks.filter(t => t.status === "in-progress").length;
  const pendingBoardTasks = boardTasks.filter(t => t.status === "todo").slice(0, 5);

  // Color palette
  const colorPalette = (fields.colorPalette as Record<string, unknown>[]) || [];
  
  // Emergency contacts
  const emergencyContacts = (fields.emergencyContacts as Record<string, unknown>[]) || [];

  const addColor = () => {
    updateField("colorPalette", [...colorPalette, { color: "", hex: "#" }]);
  };

  const updateColor = (index: number, key: string, value: string) => {
    const updated = [...colorPalette];
    updated[index] = { ...updated[index], [key]: value };
    updateField("colorPalette", updated);
  };

  const removeColor = (index: number) => {
    updateField("colorPalette", colorPalette.filter((_, i) => i !== index));
  };

  const addContact = () => {
    updateField("emergencyContacts", [...emergencyContacts, { name: "", role: "", phone: "" }]);
  };

  const updateContact = (index: number, key: string, value: string) => {
    const updated = [...emergencyContacts];
    updated[index] = { ...updated[index], [key]: value };
    updateField("emergencyContacts", updated);
  };

  const removeContact = (index: number) => {
    updateField("emergencyContacts", emergencyContacts.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white shadow-lg p-8 md:p-12">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif font-light tracking-wide">
            {coupleNames || "Wedding Overview"}
          </h2>
          <div className="w-10 h-px bg-warm-400 mx-auto mt-4" />
          {weddingDate && (
            <p className="text-warm-500 mt-4">{formatDate(weddingDate)}</p>
          )}
        </div>

        {/* Countdown & Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {/* Days Until */}
          <div className="text-center p-6 bg-gradient-to-br from-rose-50 to-warm-50 border border-warm-200">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-rose-400" />
            {daysUntil !== null ? (
              <>
                <p className="text-3xl font-light text-warm-700">
                  {daysUntil > 0 ? daysUntil : daysUntil === 0 ? "Today!" : "Married!"}
                </p>
                <p className="text-xs tracking-wider uppercase text-warm-500">
                  {daysUntil > 0 ? "Days to Go" : daysUntil === 0 ? "It's Today!" : "Days Ago"}
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-light text-warm-400">—</p>
                <p className="text-xs tracking-wider uppercase text-warm-500">Set date on cover</p>
              </>
            )}
          </div>

          {/* Guests */}
          <div className="text-center p-6 bg-warm-50 border border-warm-200">
            <Users className="w-6 h-6 mx-auto mb-2 text-warm-400" />
            <p className="text-3xl font-light text-warm-700">
              {confirmedGuests}<span className="text-lg text-warm-400">/{totalGuests}</span>
            </p>
            <p className="text-xs tracking-wider uppercase text-warm-500">Guests Confirmed</p>
          </div>

          {/* Budget */}
          <div className="text-center p-6 bg-warm-50 border border-warm-200">
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-3xl font-light text-warm-700">
              {formatCurrency(totalPaid)}
            </p>
            <p className="text-xs tracking-wider uppercase text-warm-500">
              of {formatCurrency(totalBudget)} paid
            </p>
          </div>

          {/* Wedding Party */}
          <div className="text-center p-6 bg-warm-50 border border-warm-200">
            <Heart className="w-6 h-6 mx-auto mb-2 text-pink-400" />
            <p className="text-3xl font-light text-warm-700">{weddingPartySize}</p>
            <p className="text-xs tracking-wider uppercase text-warm-500">Wedding Party</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Ceremony Details */}
            <div className="p-6 border border-warm-200">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-warm-400" />
                <h3 className="text-sm tracking-wider uppercase text-warm-500">Ceremony</h3>
              </div>
              <div className="space-y-3">
                <Input
                  value={(fields.ceremonyVenue as string) || ""}
                  onChange={(e) => updateField("ceremonyVenue", e.target.value)}
                  placeholder="Venue name"
                  className="font-medium"
                />
                <Input
                  value={(fields.ceremonyAddress as string) || ""}
                  onChange={(e) => updateField("ceremonyAddress", e.target.value)}
                  placeholder="Address"
                  className="text-sm"
                />
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-warm-400" />
                  <Input
                    value={(fields.ceremonyTime as string) || ""}
                    onChange={(e) => updateField("ceremonyTime", e.target.value)}
                    placeholder="Time (e.g., 4:00 PM)"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Reception Details */}
            <div className="p-6 border border-warm-200">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-warm-400" />
                <h3 className="text-sm tracking-wider uppercase text-warm-500">Reception</h3>
              </div>
              <div className="space-y-3">
                <Input
                  value={(fields.receptionVenue as string) || ""}
                  onChange={(e) => updateField("receptionVenue", e.target.value)}
                  placeholder="Venue name"
                  className="font-medium"
                />
                <Input
                  value={(fields.receptionAddress as string) || ""}
                  onChange={(e) => updateField("receptionAddress", e.target.value)}
                  placeholder="Address"
                  className="text-sm"
                />
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-warm-400" />
                  <Input
                    value={(fields.receptionTime as string) || ""}
                    onChange={(e) => updateField("receptionTime", e.target.value)}
                    placeholder="Time (e.g., 6:00 PM)"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Theme & Colors */}
            <div className="p-6 border border-warm-200">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-4 h-4 text-warm-400" />
                <h3 className="text-sm tracking-wider uppercase text-warm-500">Theme & Colors</h3>
              </div>
              <div className="space-y-4">
                <Input
                  value={(fields.theme as string) || ""}
                  onChange={(e) => updateField("theme", e.target.value)}
                  placeholder="Wedding theme or style (e.g., Rustic Garden)"
                />
                
                {/* Color Swatches */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Color Palette</Label>
                    <Button variant="ghost" size="sm" onClick={addColor}>
                      <Plus className="w-3 h-3 mr-1" />
                      Add Color
                    </Button>
                  </div>
                  
                  {colorPalette.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {colorPalette.map((color, index) => (
                        <div key={index} className="flex items-center gap-2 group">
                          <div
                            className="w-10 h-10 border border-warm-200 cursor-pointer"
                            style={{ backgroundColor: (color.hex as string) || "#f5f5f4" }}
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "color";
                              input.value = (color.hex as string) || "#f5f5f4";
                              input.onchange = (e) => updateColor(index, "hex", (e.target as HTMLInputElement).value);
                              input.click();
                            }}
                          />
                          <div className="flex flex-col">
                            <Input
                              value={(color.color as string) || ""}
                              onChange={(e) => updateColor(index, "color", e.target.value)}
                              placeholder="Name"
                              className="text-xs h-6 w-20"
                            />
                            <span className="text-[10px] text-warm-400 font-mono">
                              {(color.hex as string) || "#"}
                            </span>
                          </div>
                          <button
                            onClick={() => removeColor(index)}
                            className="opacity-0 group-hover:opacity-100 text-warm-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-warm-400 italic">Click &quot;Add Color&quot; to start your palette</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Task Board Tasks */}
            <div className="p-6 border border-warm-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <h3 className="text-sm tracking-wider uppercase text-warm-500">Task Board</h3>
                </div>
                {totalBoardTasks > 0 && (
                  <span className="text-xs text-warm-500">
                    {completedBoardTasks}/{totalBoardTasks} done
                  </span>
                )}
              </div>
              {totalBoardTasks > 0 ? (
                <>
                  {/* Stats row */}
                  <div className="flex gap-4 mb-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-warm-300 rounded-full" />
                      <span className="text-warm-500">To Do: {boardTasks.filter(t => t.status === "todo").length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-amber-400 rounded-full" />
                      <span className="text-warm-500">In Progress: {inProgressBoardTasks}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-warm-500">Done: {completedBoardTasks}</span>
                    </div>
                  </div>
                  {/* Pending tasks */}
                  <div className="space-y-2">
                    {pendingBoardTasks.length > 0 ? (
                      pendingBoardTasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-2 text-sm text-warm-600">
                          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                          {task.title}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-green-600">All tasks complete! 🎉</p>
                    )}
                    {boardTasks.filter(t => t.status === "todo").length > 5 && (
                      <p className="text-xs text-warm-400 mt-2">
                        +{boardTasks.filter(t => t.status === "todo").length - 5} more to do
                      </p>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="mt-4 h-1.5 bg-warm-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${totalBoardTasks > 0 ? (completedBoardTasks / totalBoardTasks) * 100 : 0}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-warm-400 italic">Add a Task Board page to track your to-dos!</p>
              )}
            </div>

            {/* Day-Of Contacts */}
            <div className="p-6 border border-warm-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-warm-400" />
                  <h3 className="text-sm tracking-wider uppercase text-warm-500">Day-Of Contacts</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={addContact}>
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-3">
                {emergencyContacts.length > 0 ? (
                  emergencyContacts.map((contact, index) => (
                    <div key={index} className="flex items-center gap-2 group">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <Input
                          value={(contact.name as string) || ""}
                          onChange={(e) => updateContact(index, "name", e.target.value)}
                          placeholder="Name"
                          className="text-sm"
                        />
                        <Input
                          value={(contact.role as string) || ""}
                          onChange={(e) => updateContact(index, "role", e.target.value)}
                          placeholder="Role"
                          className="text-sm"
                        />
                        <Input
                          value={(contact.phone as string) || ""}
                          onChange={(e) => updateContact(index, "phone", e.target.value)}
                          placeholder="Phone"
                          className="text-sm"
                        />
                      </div>
                      <button
                        onClick={() => removeContact(index)}
                        className="opacity-0 group-hover:opacity-100 text-warm-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-warm-400 italic">Add important contacts for the big day</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="p-6 border border-warm-200">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-sm tracking-wider uppercase text-warm-500">Quick Notes</h3>
              </div>
              <Textarea
                value={(fields.notes as string) || ""}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Jot down important reminders, inspiration, or ideas..."
                rows={4}
                className="text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
