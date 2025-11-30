"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Plane, Hotel, Map, Briefcase, FileText, Sparkles, DollarSign } from "lucide-react";
import { type BaseRendererProps } from "./types";

export function HoneymoonPlannerRenderer({ page, fields, updateField }: BaseRendererProps) {
  const flights = (fields.flights as Record<string, unknown>[]) || [];
  const accommodations = (fields.accommodations as Record<string, unknown>[]) || [];
  const activities = (fields.activities as Record<string, unknown>[]) || [];
  const packingList = (fields.packingList as Record<string, unknown>[]) || [];
  const documents = (fields.documents as Record<string, unknown>[]) || [];

  // Calculate trip duration
  const departureDate = fields.departureDate as string;
  const returnDate = fields.returnDate as string;
  const tripDays = departureDate && returnDate 
    ? Math.ceil((new Date(returnDate).getTime() - new Date(departureDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Helper functions for each array
  const addFlight = () => {
    updateField("flights", [...flights, { airline: "", flightNumber: "", departure: "", arrival: "", date: "", confirmationCode: "" }]);
  };

  const updateFlight = (index: number, key: string, value: string) => {
    const updated = [...flights];
    updated[index] = { ...updated[index], [key]: value };
    updateField("flights", updated);
  };

  const removeFlight = (index: number) => {
    updateField("flights", flights.filter((_, i) => i !== index));
  };

  const addAccommodation = () => {
    updateField("accommodations", [...accommodations, { name: "", checkIn: "", checkOut: "", confirmationCode: "", address: "" }]);
  };

  const updateAccommodation = (index: number, key: string, value: string) => {
    const updated = [...accommodations];
    updated[index] = { ...updated[index], [key]: value };
    updateField("accommodations", updated);
  };

  const removeAccommodation = (index: number) => {
    updateField("accommodations", accommodations.filter((_, i) => i !== index));
  };

  const addActivity = () => {
    updateField("activities", [...activities, { activity: "", date: "", time: "", confirmationCode: "", notes: "" }]);
  };

  const updateActivity = (index: number, key: string, value: string) => {
    const updated = [...activities];
    updated[index] = { ...updated[index], [key]: value };
    updateField("activities", updated);
  };

  const removeActivity = (index: number) => {
    updateField("activities", activities.filter((_, i) => i !== index));
  };

  const addPackingItem = () => {
    updateField("packingList", [...packingList, { item: "", packed: false }]);
  };

  const updatePackingItem = (index: number, key: string, value: unknown) => {
    const updated = [...packingList];
    updated[index] = { ...updated[index], [key]: value };
    updateField("packingList", updated);
  };

  const removePackingItem = (index: number) => {
    updateField("packingList", packingList.filter((_, i) => i !== index));
  };

  const addDocument = () => {
    updateField("documents", [...documents, { document: "", status: "", expirationDate: "" }]);
  };

  const updateDocument = (index: number, key: string, value: string) => {
    const updated = [...documents];
    updated[index] = { ...updated[index], [key]: value };
    updateField("documents", updated);
  };

  const removeDocument = (index: number) => {
    updateField("documents", documents.filter((_, i) => i !== index));
  };

  const packedCount = packingList.filter(item => item.packed).length;

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

        {/* Destination & Overview */}
        <div className="mb-10 p-6 bg-gradient-to-br from-blue-50 to-warm-50 border border-warm-200 rounded">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Map className="w-5 h-5 text-blue-500" />
                <Label className="text-warm-600 font-medium">Destination</Label>
              </div>
              <Input
                value={(fields.destination as string) || ""}
                onChange={(e) => updateField("destination", e.target.value)}
                placeholder="Where are you going? (e.g., Bali, Indonesia)"
                className="text-lg"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-green-500" />
                <Label className="text-warm-600 font-medium">Budget</Label>
              </div>
              <Input
                type="number"
                value={(fields.budget as string) || ""}
                onChange={(e) => updateField("budget", e.target.value)}
                placeholder="Total budget"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-warm-200">
            <div className="space-y-1">
              <Label className="text-xs text-warm-500">Departure</Label>
              <Input
                type="date"
                value={(fields.departureDate as string) || ""}
                onChange={(e) => updateField("departureDate", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-warm-500">Return</Label>
              <Input
                type="date"
                value={(fields.returnDate as string) || ""}
                onChange={(e) => updateField("returnDate", e.target.value)}
              />
            </div>
            <div className="col-span-2 flex items-end">
              {tripDays !== null && tripDays > 0 && (
                <div className="text-center w-full p-2 bg-white rounded">
                  <span className="text-2xl font-light text-blue-600">{tripDays}</span>
                  <span className="text-sm text-warm-500 ml-2">nights</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Flights */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-sky-500" />
              <h3 className="text-lg font-medium text-warm-700">Flights</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={addFlight}>
              <Plus className="w-4 h-4 mr-1" />
              Add Flight
            </Button>
          </div>

          {flights.length > 0 ? (
            <div className="space-y-3">
              {flights.map((flight, index) => (
                <div key={index} className="p-4 border border-warm-200 rounded group">
                  <div className="grid grid-cols-6 gap-3">
                    <Input
                      value={(flight.airline as string) || ""}
                      onChange={(e) => updateFlight(index, "airline", e.target.value)}
                      placeholder="Airline"
                    />
                    <Input
                      value={(flight.flightNumber as string) || ""}
                      onChange={(e) => updateFlight(index, "flightNumber", e.target.value)}
                      placeholder="Flight #"
                    />
                    <Input
                      value={(flight.departure as string) || ""}
                      onChange={(e) => updateFlight(index, "departure", e.target.value)}
                      placeholder="From"
                    />
                    <Input
                      value={(flight.arrival as string) || ""}
                      onChange={(e) => updateFlight(index, "arrival", e.target.value)}
                      placeholder="To"
                    />
                    <Input
                      type="date"
                      value={(flight.date as string) || ""}
                      onChange={(e) => updateFlight(index, "date", e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Input
                        value={(flight.confirmationCode as string) || ""}
                        onChange={(e) => updateFlight(index, "confirmationCode", e.target.value)}
                        placeholder="Confirmation"
                        className="flex-1"
                      />
                      <button
                        onClick={() => removeFlight(index)}
                        className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-warm-400 italic text-center py-6 bg-warm-50 rounded">
              No flights added yet
            </p>
          )}
        </div>

        {/* Accommodations */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Hotel className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-medium text-warm-700">Accommodations</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={addAccommodation}>
              <Plus className="w-4 h-4 mr-1" />
              Add Hotel
            </Button>
          </div>

          {accommodations.length > 0 ? (
            <div className="space-y-3">
              {accommodations.map((acc, index) => (
                <div key={index} className="p-4 border border-warm-200 rounded group">
                  <div className="grid grid-cols-5 gap-3 mb-2">
                    <Input
                      value={(acc.name as string) || ""}
                      onChange={(e) => updateAccommodation(index, "name", e.target.value)}
                      placeholder="Hotel/Resort name"
                      className="col-span-2 font-medium"
                    />
                    <Input
                      type="date"
                      value={(acc.checkIn as string) || ""}
                      onChange={(e) => updateAccommodation(index, "checkIn", e.target.value)}
                      placeholder="Check In"
                    />
                    <Input
                      type="date"
                      value={(acc.checkOut as string) || ""}
                      onChange={(e) => updateAccommodation(index, "checkOut", e.target.value)}
                      placeholder="Check Out"
                    />
                    <div className="flex gap-2">
                      <Input
                        value={(acc.confirmationCode as string) || ""}
                        onChange={(e) => updateAccommodation(index, "confirmationCode", e.target.value)}
                        placeholder="Confirmation"
                        className="flex-1"
                      />
                      <button
                        onClick={() => removeAccommodation(index)}
                        className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <Input
                    value={(acc.address as string) || ""}
                    onChange={(e) => updateAccommodation(index, "address", e.target.value)}
                    placeholder="Address"
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-warm-400 italic text-center py-6 bg-warm-50 rounded">
              No accommodations added yet
            </p>
          )}
        </div>

        {/* Activities */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-medium text-warm-700">Activities & Reservations</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={addActivity}>
              <Plus className="w-4 h-4 mr-1" />
              Add Activity
            </Button>
          </div>

          {activities.length > 0 ? (
            <div className="space-y-2">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-warm-200 rounded group">
                  <Input
                    value={(activity.activity as string) || ""}
                    onChange={(e) => updateActivity(index, "activity", e.target.value)}
                    placeholder="Activity name"
                    className="flex-1"
                  />
                  <Input
                    type="date"
                    value={(activity.date as string) || ""}
                    onChange={(e) => updateActivity(index, "date", e.target.value)}
                    className="w-36"
                  />
                  <Input
                    value={(activity.time as string) || ""}
                    onChange={(e) => updateActivity(index, "time", e.target.value)}
                    placeholder="Time"
                    className="w-24"
                  />
                  <Input
                    value={(activity.confirmationCode as string) || ""}
                    onChange={(e) => updateActivity(index, "confirmationCode", e.target.value)}
                    placeholder="Confirmation"
                    className="w-32"
                  />
                  <button
                    onClick={() => removeActivity(index)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-warm-400 italic text-center py-6 bg-warm-50 rounded">
              No activities planned yet. Add tours, dinners, or experiences!
            </p>
          )}
        </div>

        {/* Two Column Layout: Documents & Packing */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Travel Documents */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-medium text-warm-700">Documents</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={addDocument}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border border-warm-200 rounded group">
                    <Input
                      value={(doc.document as string) || ""}
                      onChange={(e) => updateDocument(index, "document", e.target.value)}
                      placeholder="Document"
                      className="flex-1 text-sm"
                    />
                    <select
                      value={(doc.status as string) || ""}
                      onChange={(e) => updateDocument(index, "status", e.target.value)}
                      className="w-28 px-2 py-1.5 border border-warm-300 text-sm rounded bg-white"
                    >
                      <option value="">Status</option>
                      <option value="Have it">Have it</option>
                      <option value="Need to get">Need to get</option>
                      <option value="Applied">Applied</option>
                      <option value="Expired">Expired</option>
                    </select>
                    <button
                      onClick={() => removeDocument(index)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-warm-400 italic text-center py-4 bg-warm-50 rounded">
                Add passports, visas, etc.
              </p>
            )}
          </div>

          {/* Packing List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-teal-500" />
                <h3 className="text-lg font-medium text-warm-700">Packing</h3>
                {packingList.length > 0 && (
                  <span className="text-xs text-warm-500">
                    {packedCount}/{packingList.length} packed
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={addPackingItem}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {packingList.length > 0 ? (
              <div className="space-y-1">
                {packingList.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border border-warm-200 rounded group hover:bg-warm-50">
                    <input
                      type="checkbox"
                      checked={(item.packed as boolean) || false}
                      onChange={(e) => updatePackingItem(index, "packed", e.target.checked)}
                      className="w-4 h-4 accent-teal-500"
                    />
                    <Input
                      value={(item.item as string) || ""}
                      onChange={(e) => updatePackingItem(index, "item", e.target.value)}
                      placeholder="Item"
                      className={`flex-1 text-sm border-0 bg-transparent ${item.packed ? "line-through text-warm-400" : ""}`}
                    />
                    <button
                      onClick={() => removePackingItem(index)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-warm-400 italic text-center py-4 bg-warm-50 rounded">
                Start your packing list!
              </p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="mt-10">
          <Label className="text-warm-600 mb-2 block">Notes</Label>
          <Textarea
            value={(fields.notes as string) || ""}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Any other notes, ideas, or things to remember..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
