"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Package } from "lucide-react";
import { type RendererWithAllPagesProps } from "./types";

export function GiftLogRenderer({ page, fields, updateField }: RendererWithAllPagesProps) {
  const gifts = (fields.gifts as Record<string, unknown>[]) || [];

  const addGift = () => {
    updateField("gifts", [...gifts, { from: "", item: "", event: "", dateReceived: "", thankYouSent: false, notes: "" }]);
  };

  const updateGift = (index: number, key: string, value: unknown) => {
    const updated = [...gifts];
    updated[index] = { ...updated[index], [key]: value };
    updateField("gifts", updated);
  };

  const removeGift = (index: number) => {
    updateField("gifts", gifts.filter((_, i) => i !== index));
  };

  // Stats
  const totalGifts = gifts.length;
  const thankYousSent = gifts.filter(g => g.thankYouSent).length;
  const thankYousPending = totalGifts - thankYousSent;

  // Group by event
  const weddingGifts = gifts.filter(g => g.event === "Wedding");
  const showerGifts = gifts.filter(g => g.event === "Bridal Shower");
  const engagementGifts = gifts.filter(g => g.event === "Engagement Party");
  const otherGifts = gifts.filter(g => g.event === "Other" || !g.event);

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
            <p className="text-2xl font-light text-warm-700">{totalGifts}</p>
            <p className="text-xs tracking-wider uppercase text-warm-500">Total Gifts</p>
          </div>
          <div className="text-center p-4 bg-green-50 border border-green-200">
            <p className="text-2xl font-light text-green-600">{thankYousSent}</p>
            <p className="text-xs tracking-wider uppercase text-green-600">Thank Yous Sent</p>
          </div>
          <div className="text-center p-4 bg-amber-50 border border-amber-200">
            <p className="text-2xl font-light text-amber-600">{thankYousPending}</p>
            <p className="text-xs tracking-wider uppercase text-amber-600">Thank Yous Pending</p>
          </div>
        </div>

        {/* Quick Stats by Event */}
        {totalGifts > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            {weddingGifts.length > 0 && (
              <span className="px-3 py-1 bg-pink-100 text-pink-700 text-sm rounded-full">
                Wedding: {weddingGifts.length}
              </span>
            )}
            {showerGifts.length > 0 && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                Bridal Shower: {showerGifts.length}
              </span>
            )}
            {engagementGifts.length > 0 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                Engagement: {engagementGifts.length}
              </span>
            )}
            {otherGifts.length > 0 && (
              <span className="px-3 py-1 bg-warm-100 text-warm-700 text-sm rounded-full">
                Other: {otherGifts.length}
              </span>
            )}
          </div>
        )}

        {/* Add Gift Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-pink-500" />
            <h3 className="text-lg font-medium text-warm-700">Gifts Received</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={addGift}>
            <Plus className="w-4 h-4 mr-1" />
            Add Gift
          </Button>
        </div>

        {/* Gifts Table */}
        {gifts.length > 0 ? (
          <>
            {/* Table Header */}
            <div className="border-b-2 border-warm-800 pb-2 grid grid-cols-[1.5fr,1.5fr,120px,100px,80px,1fr,40px] gap-2 mb-2">
              <span className="text-[10px] tracking-wider uppercase text-warm-500">From</span>
              <span className="text-[10px] tracking-wider uppercase text-warm-500">Gift</span>
              <span className="text-[10px] tracking-wider uppercase text-warm-500">Event</span>
              <span className="text-[10px] tracking-wider uppercase text-warm-500">Date</span>
              <span className="text-[10px] tracking-wider uppercase text-warm-500">Thank You</span>
              <span className="text-[10px] tracking-wider uppercase text-warm-500">Notes</span>
              <span></span>
            </div>

            <div className="space-y-2">
              {gifts.map((gift, index) => (
                <div
                  key={index}
                  className={`border-b border-warm-200 pb-2 grid grid-cols-[1.5fr,1.5fr,120px,100px,80px,1fr,40px] gap-2 items-center group ${
                    gift.thankYouSent ? "bg-green-50/50" : ""
                  }`}
                >
                  <Input
                    value={(gift.from as string) || ""}
                    onChange={(e) => updateGift(index, "from", e.target.value)}
                    placeholder="Who gave it?"
                  />
                  <Input
                    value={(gift.item as string) || ""}
                    onChange={(e) => updateGift(index, "item", e.target.value)}
                    placeholder="What was it?"
                  />
                  <select
                    value={(gift.event as string) || ""}
                    onChange={(e) => updateGift(index, "event", e.target.value)}
                    className="px-2 py-1.5 border border-warm-300 text-sm focus:outline-none focus:border-warm-500 bg-white"
                  >
                    <option value="">Event...</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Bridal Shower">Bridal Shower</option>
                    <option value="Engagement Party">Engagement Party</option>
                    <option value="Other">Other</option>
                  </select>
                  <Input
                    type="date"
                    value={(gift.dateReceived as string) || ""}
                    onChange={(e) => updateGift(index, "dateReceived", e.target.value)}
                    className="text-sm"
                  />
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={(gift.thankYouSent as boolean) || false}
                      onChange={(e) => updateGift(index, "thankYouSent", e.target.checked)}
                      className="w-5 h-5 accent-green-500"
                    />
                  </div>
                  <Input
                    value={(gift.notes as string) || ""}
                    onChange={(e) => updateGift(index, "notes", e.target.value)}
                    placeholder="Notes for thank you"
                    className="text-sm"
                  />
                  <button
                    onClick={() => removeGift(index)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-warm-400 italic text-center py-8 bg-warm-50 rounded">
            No gifts logged yet. Add gifts as you receive them to track thank-you notes!
          </p>
        )}
      </div>
    </div>
  );
}
