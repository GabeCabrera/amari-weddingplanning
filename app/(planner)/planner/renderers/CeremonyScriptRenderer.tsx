"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ScrollText, Heart, FileText, Mic2, ChevronUp, ChevronDown } from "lucide-react";
import { type BaseRendererProps, type CeremonyElement, type Reading } from "./types";
import { CEREMONY_ELEMENTS } from "./shared";

export function CeremonyScriptRenderer({ page, fields, updateField }: BaseRendererProps) {
  const elements = (fields.elements as CeremonyElement[]) || [];
  const readings = (fields.readings as Reading[]) || [];
  const [expandedVows, setExpandedVows] = useState<"partner1" | "partner2" | null>(null);
  const [expandedElement, setExpandedElement] = useState<number | null>(null);

  const addElement = () => {
    updateField("elements", [...elements, { element: "", person: "", content: "", duration: "" }]);
  };

  const updateElement = (index: number, key: string, value: string) => {
    const updated = [...elements];
    updated[index] = { ...updated[index], [key]: value };
    updateField("elements", updated);
  };

  const removeElement = (index: number) => {
    updateField("elements", elements.filter((_, i) => i !== index));
  };

  const moveElement = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === elements.length - 1) return;
    
    const updated = [...elements];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updateField("elements", updated);
  };

  const addReading = () => {
    updateField("readings", [...readings, { title: "", author: "", reader: "", text: "" }]);
  };

  const updateReading = (index: number, key: string, value: string) => {
    const updated = [...readings];
    updated[index] = { ...updated[index], [key]: value };
    updateField("readings", updated);
  };

  const removeReading = (index: number) => {
    updateField("readings", readings.filter((_, i) => i !== index));
  };

  // Calculate total estimated time
  const totalMinutes = elements.reduce((total, el) => {
    const mins = parseInt(el.duration) || 0;
    return total + mins;
  }, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0">
      <div className="bg-white shadow-lg p-4 md:p-8 lg:p-12">
        {/* Page Header */}
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-serif font-light tracking-wide">
            {page.title}
          </h2>
          <div className="w-10 h-px bg-warm-400 mx-auto mt-3 md:mt-4" />
        </div>

        {/* Ceremony Info */}
        <div className="mb-8 md:mb-10 p-4 md:p-6 bg-warm-50 border border-warm-200 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="space-y-1 md:space-y-2">
              <Label className="text-xs md:text-sm text-warm-600">Officiant Name</Label>
              <Input
                value={(fields.officiantName as string) || ""}
                onChange={(e) => updateField("officiantName", e.target.value)}
                placeholder="Who will officiate?"
                className="text-sm"
              />
            </div>
            <div className="space-y-1 md:space-y-2">
              <Label className="text-xs md:text-sm text-warm-600">Ceremony Style</Label>
              <select
                value={(fields.ceremonyStyle as string) || ""}
                onChange={(e) => updateField("ceremonyStyle", e.target.value)}
                className="w-full px-3 py-2 border border-warm-300 text-sm focus:outline-none focus:border-warm-500 bg-white rounded"
              >
                <option value="">Select style...</option>
                <option value="Traditional">Traditional</option>
                <option value="Modern">Modern</option>
                <option value="Religious">Religious</option>
                <option value="Non-denominational">Non-denominational</option>
                <option value="Spiritual">Spiritual</option>
                <option value="Elopement">Elopement</option>
              </select>
            </div>
            <div className="space-y-1 md:space-y-2">
              <Label className="text-xs md:text-sm text-warm-600">Estimated Length</Label>
              <div className="flex items-center gap-2">
                <select
                  value={(fields.estimatedLength as string) || ""}
                  onChange={(e) => updateField("estimatedLength", e.target.value)}
                  className="flex-1 px-3 py-2 border border-warm-300 text-sm focus:outline-none focus:border-warm-500 bg-white rounded"
                >
                  <option value="">Select...</option>
                  <option value="15 minutes">15 min</option>
                  <option value="20 minutes">20 min</option>
                  <option value="30 minutes">30 min</option>
                  <option value="45 minutes">45 min</option>
                  <option value="1 hour">1 hour</option>
                </select>
                {totalMinutes > 0 && (
                  <span className="text-[10px] md:text-xs text-warm-500 whitespace-nowrap">
                    ~{totalMinutes}m
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ceremony Flow */}
        <div className="mb-8 md:mb-10">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center gap-2">
              <ScrollText className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
              <h3 className="text-base md:text-lg font-medium text-warm-700">Ceremony Flow</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={addElement}>
              <Plus className="w-4 h-4 md:mr-1" />
              <span className="hidden md:inline">Add</span>
            </Button>
          </div>

          {elements.length > 0 ? (
            <div className="space-y-2">
              {elements.map((el, index) => (
                <div key={index} className="border border-warm-200 rounded-lg overflow-hidden group bg-white hover:border-warm-300 transition-colors">
                  {/* Mobile: Card View */}
                  <div className="md:hidden">
                    <button
                      onClick={() => setExpandedElement(expandedElement === index ? null : index)}
                      className="w-full p-3 flex items-center gap-2"
                    >
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveElement(index, "up"); }}
                          disabled={index === 0}
                          className="p-0.5 text-warm-400 hover:text-warm-600 disabled:opacity-30"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveElement(index, "down"); }}
                          disabled={index === elements.length - 1}
                          className="p-0.5 text-warm-400 hover:text-warm-600 disabled:opacity-30"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs text-warm-400">{index + 1}.</span>
                      <span className="flex-1 text-left text-sm font-medium text-warm-700 truncate">
                        {el.element || "New Element"}
                      </span>
                      {el.duration && (
                        <span className="text-xs text-warm-400">{el.duration}m</span>
                      )}
                      {expandedElement === index ? (
                        <ChevronUp className="w-4 h-4 text-warm-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-warm-400" />
                      )}
                    </button>
                    
                    {expandedElement === index && (
                      <div className="p-3 pt-0 space-y-2 border-t border-warm-100">
                        <select
                          value={el.element || ""}
                          onChange={(e) => updateElement(index, "element", e.target.value)}
                          className="w-full px-2 py-1.5 border border-warm-300 text-sm rounded bg-white"
                        >
                          <option value="">Select element...</option>
                          {CEREMONY_ELEMENTS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={el.person || ""}
                            onChange={(e) => updateElement(index, "person", e.target.value)}
                            placeholder="Person"
                            className="text-sm"
                          />
                          <Input
                            value={el.duration || ""}
                            onChange={(e) => updateElement(index, "duration", e.target.value)}
                            placeholder="Min"
                            className="text-sm"
                          />
                        </div>
                        <Input
                          value={el.content || ""}
                          onChange={(e) => updateElement(index, "content", e.target.value)}
                          placeholder="Notes or content"
                          className="text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeElement(index)}
                          className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Desktop: Row View */}
                  <div className="hidden md:flex items-start gap-2 p-3">
                    <div className="flex flex-col gap-1 pt-2">
                      <button
                        onClick={() => moveElement(index, "up")}
                        disabled={index === 0}
                        className="p-0.5 text-warm-400 hover:text-warm-600 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveElement(index, "down")}
                        disabled={index === elements.length - 1}
                        className="p-0.5 text-warm-400 hover:text-warm-600 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-sm text-warm-400 pt-2 w-6">{index + 1}.</span>
                    <select
                      value={el.element || ""}
                      onChange={(e) => updateElement(index, "element", e.target.value)}
                      className="w-48 px-2 py-1.5 border border-warm-300 text-sm focus:outline-none focus:border-warm-500 bg-white rounded"
                    >
                      <option value="">Select element...</option>
                      {CEREMONY_ELEMENTS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <Input
                      value={el.person || ""}
                      onChange={(e) => updateElement(index, "person", e.target.value)}
                      placeholder="Person/Reader"
                      className="w-32 text-sm"
                    />
                    <Input
                      value={el.content || ""}
                      onChange={(e) => updateElement(index, "content", e.target.value)}
                      placeholder="Notes or content"
                      className="flex-1 text-sm"
                    />
                    <Input
                      value={el.duration || ""}
                      onChange={(e) => updateElement(index, "duration", e.target.value)}
                      placeholder="Min"
                      className="w-16 text-sm text-center"
                    />
                    <button
                      onClick={() => removeElement(index)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 md:py-8 bg-warm-50 rounded-lg">
              <p className="text-xs md:text-sm text-warm-500 mb-3">No ceremony elements yet</p>
              <Button variant="outline" size="sm" onClick={addElement}>
                <Plus className="w-4 h-4 mr-1" />
                Add Your First Element
              </Button>
            </div>
          )}
        </div>

        {/* Personal Vows */}
        <div className="mb-8 md:mb-10">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Heart className="w-4 h-4 md:w-5 md:h-5 text-pink-500" />
            <h3 className="text-base md:text-lg font-medium text-warm-700">Personal Vows</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="border border-warm-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedVows(expandedVows === "partner1" ? null : "partner1")}
                className="w-full p-3 flex items-center justify-between bg-warm-50 hover:bg-warm-100 transition-colors"
              >
                <span className="font-medium text-warm-700 text-sm md:text-base">Partner 1 Vows</span>
                {expandedVows === "partner1" ? (
                  <ChevronUp className="w-4 h-4 text-warm-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-warm-500" />
                )}
              </button>
              {expandedVows === "partner1" && (
                <div className="p-3">
                  <Textarea
                    value={(fields.partner1Vows as string) || ""}
                    onChange={(e) => updateField("partner1Vows", e.target.value)}
                    placeholder="Write your vows here..."
                    rows={6}
                    className="text-sm"
                  />
                </div>
              )}
            </div>

            <div className="border border-warm-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedVows(expandedVows === "partner2" ? null : "partner2")}
                className="w-full p-3 flex items-center justify-between bg-warm-50 hover:bg-warm-100 transition-colors"
              >
                <span className="font-medium text-warm-700 text-sm md:text-base">Partner 2 Vows</span>
                {expandedVows === "partner2" ? (
                  <ChevronUp className="w-4 h-4 text-warm-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-warm-500" />
                )}
              </button>
              {expandedVows === "partner2" && (
                <div className="p-3">
                  <Textarea
                    value={(fields.partner2Vows as string) || ""}
                    onChange={(e) => updateField("partner2Vows", e.target.value)}
                    placeholder="Write your vows here..."
                    rows={6}
                    className="text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Readings */}
        <div className="mb-8 md:mb-10">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
              <h3 className="text-base md:text-lg font-medium text-warm-700">Readings</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={addReading}>
              <Plus className="w-4 h-4 md:mr-1" />
              <span className="hidden md:inline">Add</span>
            </Button>
          </div>

          {readings.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              {readings.map((reading, index) => (
                <div key={index} className="p-3 md:p-4 border border-warm-200 rounded-lg group">
                  <div className="flex items-start justify-between mb-2 md:mb-3">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                      <Input
                        value={reading.title || ""}
                        onChange={(e) => updateReading(index, "title", e.target.value)}
                        placeholder="Title"
                        className="font-medium text-sm"
                      />
                      <Input
                        value={reading.author || ""}
                        onChange={(e) => updateReading(index, "author", e.target.value)}
                        placeholder="Author"
                        className="text-sm"
                      />
                      <Input
                        value={reading.reader || ""}
                        onChange={(e) => updateReading(index, "reader", e.target.value)}
                        placeholder="Reader"
                        className="text-sm"
                      />
                    </div>
                    <button
                      onClick={() => removeReading(index)}
                      className="p-1 ml-2 md:opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Textarea
                    value={reading.text || ""}
                    onChange={(e) => updateReading(index, "text", e.target.value)}
                    placeholder="Full text of the reading..."
                    rows={3}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs md:text-sm text-warm-400 italic text-center py-4 md:py-6 bg-warm-50 rounded-lg">
              No readings added yet. Add poems, passages, or quotes.
            </p>
          )}
        </div>

        {/* Officiant Script */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Mic2 className="w-4 h-4 md:w-5 md:h-5 text-warm-500" />
            <h3 className="text-base md:text-lg font-medium text-warm-700">Officiant Script</h3>
          </div>
          <Textarea
            value={(fields.officiantScript as string) || ""}
            onChange={(e) => updateField("officiantScript", e.target.value)}
            placeholder="Draft the full ceremony script here..."
            rows={8}
            className="text-sm"
          />
        </div>

        {/* Additional Notes */}
        <div>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <FileText className="w-4 h-4 md:w-5 md:h-5 text-warm-400" />
            <h3 className="text-base md:text-lg font-medium text-warm-700">Additional Notes</h3>
          </div>
          <Textarea
            value={(fields.notes as string) || ""}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Any other notes, reminders, or ideas..."
            rows={4}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
