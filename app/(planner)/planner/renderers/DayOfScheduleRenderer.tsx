"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Plus, Trash2, Clock, MapPin, Users, GripVertical,
  ChevronDown, ChevronUp, Sparkles, Camera, Music,
  Heart, Copy
} from "lucide-react";
import { toast } from "sonner";
import { type RendererWithAllPagesProps, type ScheduleEvent, type PartyMember } from "./types";
import { UpgradePrompt, UPGRADE_SUGGESTIONS } from "./shared";
import { useUserPlan } from "../context";
import { Heart as WeddingPartyIcon } from "lucide-react";

const EVENT_CATEGORIES = [
  { id: "prep", label: "Prep", icon: Sparkles, color: "bg-pink-100 border-pink-300 text-pink-700" },
  { id: "ceremony", label: "Ceremony", icon: Heart, color: "bg-purple-100 border-purple-300 text-purple-700" },
  { id: "photos", label: "Photos", icon: Camera, color: "bg-blue-100 border-blue-300 text-blue-700" },
  { id: "reception", label: "Reception", icon: Music, color: "bg-amber-100 border-amber-300 text-amber-700" },
  { id: "other", label: "Other", icon: Clock, color: "bg-warm-100 border-warm-300 text-warm-700" },
];

const COMMON_EVENTS = [
  { time: "8:00 AM", event: "Hair & Makeup Begins", category: "prep" },
  { time: "10:00 AM", event: "Photographer Arrives", category: "prep" },
  { time: "11:00 AM", event: "Getting Ready Photos", category: "photos" },
  { time: "12:00 PM", event: "Light Lunch", category: "prep" },
  { time: "2:00 PM", event: "First Look", category: "photos" },
  { time: "2:30 PM", event: "Wedding Party Photos", category: "photos" },
  { time: "3:30 PM", event: "Guests Arrive", category: "ceremony" },
  { time: "4:00 PM", event: "Ceremony Begins", category: "ceremony" },
  { time: "4:30 PM", event: "Ceremony Ends", category: "ceremony" },
  { time: "4:45 PM", event: "Family Photos", category: "photos" },
  { time: "5:30 PM", event: "Cocktail Hour", category: "reception" },
  { time: "6:30 PM", event: "Grand Entrance", category: "reception" },
  { time: "6:45 PM", event: "First Dance", category: "reception" },
  { time: "7:00 PM", event: "Dinner Service", category: "reception" },
  { time: "7:45 PM", event: "Toasts & Speeches", category: "reception" },
  { time: "8:15 PM", event: "Cake Cutting", category: "reception" },
  { time: "8:30 PM", event: "Parent Dances", category: "reception" },
  { time: "8:45 PM", event: "Open Dancing", category: "reception" },
  { time: "10:30 PM", event: "Last Dance", category: "reception" },
  { time: "10:45 PM", event: "Send Off", category: "reception" },
];

export function DayOfScheduleRenderer({ page, fields, updateField, allPages }: RendererWithAllPagesProps) {
  const { isFree } = useUserPlan();
  const rawEvents = fields.events;
  const events: ScheduleEvent[] = Array.isArray(rawEvents) ? rawEvents : [];
  
  const [showTemplates, setShowTemplates] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  // Get wedding party for assignee suggestions
  const weddingPartyPage = allPages.find(p => p.templateId === "wedding-party");
  const partyFields = (weddingPartyPage?.fields || {}) as Record<string, unknown>;
  const bridesmaids: PartyMember[] = Array.isArray(partyFields.bridesmaids) ? partyFields.bridesmaids : [];
  const groomsmen: PartyMember[] = Array.isArray(partyFields.groomsmen) ? partyFields.groomsmen : [];
  const otherParty: PartyMember[] = Array.isArray(partyFields.others) ? partyFields.others : [];

  // Get vendor contacts for assignee suggestions
  const vendorPage = allPages.find(p => p.templateId === "vendor-contacts");
  const vendorFields = (vendorPage?.fields || {}) as Record<string, unknown>;
  const vendors: { company: string; category: string }[] = Array.isArray(vendorFields.vendors) ? vendorFields.vendors : [];

  const assigneeSuggestions = [
    { group: "Couple", names: ["Bride", "Groom", "Both"] },
    { group: "Wedding Party", names: [...bridesmaids.map(b => b.name), ...groomsmen.map(g => g.name), ...otherParty.map(o => o.name)].filter(Boolean) },
    { group: "Vendors", names: vendors.map(v => v.company || v.category).filter(Boolean) },
    { group: "Other", names: ["Coordinator", "DJ", "Photographer", "Videographer"] },
  ];

  const generateId = () => `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addEvent = () => {
    const newEvent: ScheduleEvent = {
      id: generateId(),
      time: "",
      endTime: "",
      event: "",
      location: "",
      assignees: [],
      notes: "",
      category: "other",
    };
    updateField("events", [...events, newEvent]);
    setExpandedEvent(newEvent.id);
  };

  const addFromTemplate = (template: typeof COMMON_EVENTS[0]) => {
    const newEvent: ScheduleEvent = {
      id: generateId(),
      time: template.time,
      event: template.event,
      category: template.category as ScheduleEvent["category"],
      assignees: [],
      notes: "",
    };
    updateField("events", [...events, newEvent]);
    toast.success(`Added: ${template.event}`);
  };

  const addAllTemplates = () => {
    const newEvents = COMMON_EVENTS.map(template => ({
      id: generateId(),
      time: template.time,
      event: template.event,
      category: template.category as ScheduleEvent["category"],
      assignees: [],
      notes: "",
    }));
    updateField("events", [...events, ...newEvents]);
    toast.success(`Added ${newEvents.length} events`);
    setShowTemplates(false);
  };

  const updateEvent = (index: number, key: string, value: unknown) => {
    const updated = [...events];
    updated[index] = { ...updated[index], [key]: value };
    updateField("events", updated);
  };

  const removeEvent = (index: number) => {
    updateField("events", events.filter((_, i) => i !== index));
  };

  const toggleAssignee = (eventIndex: number, name: string) => {
    const event = events[eventIndex];
    const currentAssignees = event.assignees || [];
    const isAssigned = currentAssignees.includes(name);
    updateEvent(eventIndex, "assignees", isAssigned ? currentAssignees.filter(a => a !== name) : [...currentAssignees, name]);
  };

  const sortedEvents = [...events].sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  const eventsByCategory = events.reduce((acc, event) => {
    const cat = event.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(event);
    return acc;
  }, {} as Record<string, ScheduleEvent[]>);

  const getCategoryInfo = (categoryId: string) => EVENT_CATEGORIES.find(c => c.id === categoryId) || EVENT_CATEGORIES[4];

  const copySchedule = () => {
    const scheduleText = sortedEvents
      .map(e => `${e.time}${e.endTime ? ` - ${e.endTime}` : ""}: ${e.event}${e.location ? ` @ ${e.location}` : ""}`)
      .join("\n");
    navigator.clipboard.writeText(scheduleText);
    toast.success("Schedule copied!");
  };

  const firstEventTime = sortedEvents[0]?.time;
  const lastEventTime = sortedEvents[sortedEvents.length - 1]?.time;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg p-4 sm:p-6 md:p-12">
        {/* Page Header */}
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-serif font-light tracking-wide">
            {page.title}
          </h2>
          <div className="w-10 h-px bg-warm-400 mx-auto mt-4" />
          {firstEventTime && lastEventTime && (
            <p className="text-warm-500 mt-3 text-sm">{firstEventTime} — {lastEventTime}</p>
          )}
        </div>

        {/* Category Summary - Scrollable on mobile */}
        <div className="flex gap-2 mb-6 md:mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-5">
          {EVENT_CATEGORIES.map(cat => {
            const count = eventsByCategory[cat.id]?.length || 0;
            const Icon = cat.icon;
            return (
              <div 
                key={cat.id}
                className={`flex-shrink-0 text-center p-2 md:p-3 rounded-lg border ${cat.color} min-w-[70px] md:min-w-0`}
              >
                <Icon className="w-4 h-4 md:w-5 md:h-5 mx-auto mb-1" />
                <p className="text-xs font-medium">{count}</p>
                <p className="text-[9px] md:text-[10px] uppercase tracking-wider opacity-75">{cat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-6">
          <Button variant="outline" size="sm" onClick={() => setShowTemplates(!showTemplates)} className="flex-1 sm:flex-none">
            <Sparkles className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">{showTemplates ? "Hide" : "Add from"}</span> Templates
          </Button>
          <Button variant="outline" size="sm" onClick={addEvent} className="flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Add</span> Event
          </Button>
          {events.length > 0 && (
            <Button variant="outline" size="sm" onClick={copySchedule}>
              <Copy className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Copy</span>
            </Button>
          )}
        </div>

        {/* Templates */}
        {showTemplates && (
          <div className="mb-6 md:mb-8 p-3 md:p-4 border border-warm-200 rounded-lg bg-warm-50">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-sm md:text-base font-medium text-warm-700">Common Events</h3>
              <Button size="sm" onClick={addAllTemplates}>
                Add All
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 md:max-h-64 overflow-y-auto">
              {COMMON_EVENTS.map((template, idx) => {
                const cat = getCategoryInfo(template.category);
                const Icon = cat.icon;
                const alreadyAdded = events.some(e => e.event.toLowerCase() === template.event.toLowerCase());
                
                return (
                  <button
                    key={idx}
                    onClick={() => !alreadyAdded && addFromTemplate(template)}
                    disabled={alreadyAdded}
                    className={`flex items-center gap-2 md:gap-3 p-2 rounded border text-left transition-colors ${
                      alreadyAdded 
                        ? "bg-warm-100 border-warm-200 opacity-50"
                        : "bg-white border-warm-200 hover:border-warm-400"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-warm-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium text-warm-700 truncate">{template.event}</p>
                      <p className="text-[10px] md:text-xs text-warm-500">{template.time}</p>
                    </div>
                    {alreadyAdded && <span className="text-[10px] text-warm-400">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Timeline - Card-based for mobile */}
        {events.length > 0 ? (
          <div className="space-y-3">
            {sortedEvents.map((event, index) => {
              const cat = getCategoryInfo(event.category);
              const Icon = cat.icon;
              const isExpanded = expandedEvent === event.id;
              const originalIndex = events.findIndex(e => e.id === event.id);

              return (
                <div key={event.id} className="border border-warm-200 rounded-lg overflow-hidden bg-white">
                  {/* Card Header */}
                  <button
                    onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                    className="w-full p-3 md:p-4 text-left"
                  >
                    <div className="flex items-start gap-3">
                      {/* Category icon */}
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cat.color} border`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs md:text-sm font-medium text-warm-500">{event.time || "No time"}</span>
                          {event.endTime && <span className="text-xs text-warm-400">— {event.endTime}</span>}
                        </div>
                        <p className="font-medium text-warm-800 truncate text-sm md:text-base">
                          {event.event || "Untitled Event"}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-warm-500">
                          {event.location && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              {event.location}
                            </span>
                          )}
                          {event.assignees && event.assignees.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 flex-shrink-0" />
                              {event.assignees.length}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-warm-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-warm-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-3 md:px-4 pb-4 space-y-4 border-t border-warm-100">
                      <div className="pt-4 space-y-3">
                        {/* Time inputs */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-warm-500">Start Time</Label>
                            <Input
                              value={event.time || ""}
                              onChange={(e) => updateEvent(originalIndex, "time", e.target.value)}
                              placeholder="e.g., 4:00 PM"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-warm-500">End Time</Label>
                            <Input
                              value={event.endTime || ""}
                              onChange={(e) => updateEvent(originalIndex, "endTime", e.target.value)}
                              placeholder="e.g., 4:30 PM"
                            />
                          </div>
                        </div>

                        {/* Event name */}
                        <div>
                          <Label className="text-xs text-warm-500">Event Name</Label>
                          <Input
                            value={event.event || ""}
                            onChange={(e) => updateEvent(originalIndex, "event", e.target.value)}
                            placeholder="What's happening?"
                          />
                        </div>

                        {/* Category & Location */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-warm-500">Category</Label>
                            <select
                              value={event.category || "other"}
                              onChange={(e) => updateEvent(originalIndex, "category", e.target.value)}
                              className="w-full mt-1 px-3 py-2 border border-warm-300 rounded-lg text-sm"
                            >
                              {EVENT_CATEGORIES.map(c => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label className="text-xs text-warm-500">Location</Label>
                            <Input
                              value={event.location || ""}
                              onChange={(e) => updateEvent(originalIndex, "location", e.target.value)}
                              placeholder="Where?"
                            />
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <Label className="text-xs text-warm-500">Notes</Label>
                          <Textarea
                            value={event.notes || ""}
                            onChange={(e) => updateEvent(originalIndex, "notes", e.target.value)}
                            placeholder="Additional details..."
                            rows={2}
                          />
                        </div>

                        {/* Assignees */}
                        <div>
                          <Label className="text-xs text-warm-500 mb-2 block">Who&apos;s Involved?</Label>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {assigneeSuggestions.map(group => (
                              group.names.length > 0 && (
                                <div key={group.group}>
                                  <p className="text-[10px] uppercase tracking-wider text-warm-400 mb-1">{group.group}</p>
                                  <div className="flex flex-wrap gap-1">
                                    {group.names.map(name => {
                                      const isSelected = event.assignees?.includes(name);
                                      return (
                                        <button
                                          key={name}
                                          onClick={() => toggleAssignee(originalIndex, name)}
                                          className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                                            isSelected
                                              ? "bg-warm-600 text-white border-warm-600"
                                              : "bg-white border-warm-300"
                                          }`}
                                        >
                                          {name}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeEvent(originalIndex)}
                        className="w-full py-2 text-sm text-red-500 hover:text-red-600 transition-colors border-t border-warm-100"
                      >
                        Remove Event
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 md:py-12 bg-warm-50 rounded-lg">
            <Clock className="w-10 h-10 md:w-12 md:h-12 mx-auto text-warm-300 mb-3 md:mb-4" />
            <p className="text-warm-500 mb-2 text-sm md:text-base">No events scheduled yet</p>
            <p className="text-xs md:text-sm text-warm-400 mb-4">
              Start with templates or add your own
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center px-4 sm:px-0">
              <Button variant="outline" onClick={() => setShowTemplates(true)} className="w-full sm:w-auto">
                <Sparkles className="w-4 h-4 mr-2" />
                Use Templates
              </Button>
              <Button onClick={addEvent} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </div>
          </div>
        )}

        {/* Upgrade Prompt */}
        {isFree && events.length > 0 && (
          <div className="mt-6 md:mt-8">
            <UpgradePrompt
              variant="banner"
              title={UPGRADE_SUGGESTIONS.weddingParty.title}
              description={UPGRADE_SUGGESTIONS.weddingParty.description}
              featureName={UPGRADE_SUGGESTIONS.weddingParty.featureName}
              icon={<WeddingPartyIcon className="w-5 h-5 text-purple-600" />}
            />
          </div>
        )}
      </div>
    </div>
  );
}
