"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { type EventInput, type DateSelectArg, type EventClickArg, type EventDropArg } from "@fullcalendar/core";
import { format, differenceInDays, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Settings,
  RefreshCw,
  Link2,
  Unlink,
  MapPin,
  Clock,
  Tag,
  Trash2,
  Edit,
  Check,
  Heart,
} from "lucide-react";
import { type RendererWithAllPagesProps } from "./types";
import { RelatedTemplates } from "./shared";

// ============================================================================
// TYPES
// ============================================================================
interface CalendarEventData {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  allDay: boolean;
  location?: string;
  category: EventCategory;
  color: string;
  vendorId?: string;
  taskId?: string;
  googleEventId?: string;
  syncStatus: "local" | "synced" | "pending" | "error";
}

type EventCategory = "vendor" | "deadline" | "appointment" | "milestone" | "personal" | "other";
type CalendarView = "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek";

interface GoogleConnectionStatus {
  connected: boolean;
  email?: string;
  calendarName?: string;
  lastSyncAt?: string;
  shareLink?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================
const CATEGORY_CONFIG: Record<EventCategory, { label: string; color: string; bgColor: string }> = {
  vendor: { label: "Vendor Meeting", color: "#3B82F6", bgColor: "bg-blue-500" },
  deadline: { label: "Deadline", color: "#EF4444", bgColor: "bg-red-500" },
  appointment: { label: "Appointment", color: "#8B5CF6", bgColor: "bg-purple-500" },
  milestone: { label: "Milestone", color: "#F59E0B", bgColor: "bg-amber-500" },
  personal: { label: "Personal", color: "#10B981", bgColor: "bg-emerald-500" },
  other: { label: "Other", color: "#6B7280", bgColor: "bg-gray-500" },
};

const VIEW_OPTIONS: { value: CalendarView; label: string }[] = [
  { value: "dayGridMonth", label: "Month" },
  { value: "timeGridWeek", label: "Week" },
  { value: "timeGridDay", label: "Day" },
  { value: "listWeek", label: "Agenda" },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function CalendarRenderer({ page, fields, updateField, allPages }: RendererWithAllPagesProps) {
  // State
  const [events, setEvents] = useState<CalendarEventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<CalendarView>(
    (fields.defaultView as CalendarView) || "dayGridMonth"
  );
  const [googleConnection, setGoogleConnection] = useState<GoogleConnectionStatus>({ connected: false });
  const [syncing, setSyncing] = useState(false);

  // Modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    allDay: false,
    location: "",
    category: "other" as EventCategory,
  });

  // Wedding date for countdown
  const coverPage = allPages.find(p => p.templateId === "cover");
  const weddingDateStr = (coverPage?.fields as Record<string, unknown>)?.weddingDate as string;
  const weddingDate = weddingDateStr ? parseISO(weddingDateStr) : null;
  const daysUntilWedding = weddingDate ? differenceInDays(weddingDate, new Date()) : null;

  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch("/api/calendar/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGoogleStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/calendar/google/status");
      if (response.ok) {
        const data = await response.json();
        setGoogleConnection(data);
      }
    } catch (error) {
      console.error("Failed to fetch Google status:", error);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchGoogleStatus();
  }, [fetchEvents, fetchGoogleStatus]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const startDate = format(selectInfo.start, "yyyy-MM-dd");
    const endDate = selectInfo.end ? format(selectInfo.end, "yyyy-MM-dd") : startDate;
    const startTime = selectInfo.allDay ? "" : format(selectInfo.start, "HH:mm");
    const endTime = selectInfo.allDay || !selectInfo.end ? "" : format(selectInfo.end, "HH:mm");

    setNewEvent({
      title: "",
      description: "",
      startDate,
      startTime,
      endDate,
      endTime,
      allDay: selectInfo.allDay,
      location: "",
      category: "other",
    });
    setSelectedEvent(null);
    setIsEditing(false);
    setShowEventModal(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = events.find(e => e.id === clickInfo.event.id);
    if (event) {
      setSelectedEvent(event);
      setNewEvent({
        title: event.title,
        description: event.description || "",
        startDate: format(parseISO(event.startTime), "yyyy-MM-dd"),
        startTime: event.allDay ? "" : format(parseISO(event.startTime), "HH:mm"),
        endDate: event.endTime ? format(parseISO(event.endTime), "yyyy-MM-dd") : "",
        endTime: event.endTime && !event.allDay ? format(parseISO(event.endTime), "HH:mm") : "",
        allDay: event.allDay,
        location: event.location || "",
        category: event.category,
      });
      setIsEditing(false);
      setShowEventModal(true);
    }
  };

  const handleEventDrop = async (dropInfo: EventDropArg) => {
    const event = events.find(e => e.id === dropInfo.event.id);
    if (!event) return;

    const newStartTime = dropInfo.event.start?.toISOString();
    const newEndTime = dropInfo.event.end?.toISOString();

    try {
      const response = await fetch(`/api/calendar/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: newStartTime,
          endTime: newEndTime,
        }),
      });

      if (response.ok) {
        setEvents(prev => prev.map(e =>
          e.id === event.id
            ? { ...e, startTime: newStartTime!, endTime: newEndTime || undefined }
            : e
        ));
        toast.success("Event rescheduled");
      } else {
        dropInfo.revert();
        toast.error("Failed to reschedule event");
      }
    } catch (error) {
      dropInfo.revert();
      toast.error("Failed to reschedule event");
    }
  };

  const handleSaveEvent = async () => {
    if (!newEvent.title.trim()) {
      toast.error("Please enter an event title");
      return;
    }

    const startTime = newEvent.allDay
      ? `${newEvent.startDate}T00:00:00`
      : `${newEvent.startDate}T${newEvent.startTime}:00`;

    const endTime = newEvent.endDate
      ? newEvent.allDay
        ? `${newEvent.endDate}T23:59:59`
        : `${newEvent.endDate}T${newEvent.endTime || newEvent.startTime}:00`
      : undefined;

    const eventData = {
      title: newEvent.title.trim(),
      description: newEvent.description.trim() || undefined,
      startTime,
      endTime,
      allDay: newEvent.allDay,
      location: newEvent.location.trim() || undefined,
      category: newEvent.category,
      color: CATEGORY_CONFIG[newEvent.category].color,
    };

    try {
      if (selectedEvent && isEditing) {
        // Update existing event
        const response = await fetch(`/api/calendar/events/${selectedEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });

        if (response.ok) {
          const updated = await response.json();
          setEvents(prev => prev.map(e => e.id === selectedEvent.id ? updated.event : e));
          toast.success("Event updated");
        } else {
          toast.error("Failed to update event");
          return;
        }
      } else {
        // Create new event
        const response = await fetch("/api/calendar/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });

        if (response.ok) {
          const created = await response.json();
          setEvents(prev => [...prev, created.event]);
          toast.success("Event created");
        } else {
          toast.error("Failed to create event");
          return;
        }
      }

      setShowEventModal(false);
      setSelectedEvent(null);
      resetNewEvent();
    } catch (error) {
      toast.error("Failed to save event");
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      const response = await fetch(`/api/calendar/events/${selectedEvent.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
        setShowEventModal(false);
        setSelectedEvent(null);
        toast.success("Event deleted");
      } else {
        toast.error("Failed to delete event");
      }
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  const resetNewEvent = () => {
    setNewEvent({
      title: "",
      description: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      allDay: false,
      location: "",
      category: "other",
    });
  };

  // ============================================================================
  // GOOGLE CALENDAR HANDLERS
  // ============================================================================
  const handleConnectGoogle = () => {
    window.location.href = "/api/calendar/google/connect";
  };

  const handleDisconnectGoogle = async () => {
    if (!confirm("Disconnect Google Calendar? Your events will remain in Aisle but won't sync.")) {
      return;
    }

    try {
      const response = await fetch("/api/calendar/google/disconnect", { method: "POST" });
      if (response.ok) {
        setGoogleConnection({ connected: false });
        toast.success("Google Calendar disconnected");
      }
    } catch (error) {
      toast.error("Failed to disconnect");
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/calendar/google/sync", { method: "POST" });
      if (response.ok) {
        await fetchEvents();
        await fetchGoogleStatus();
        toast.success("Calendar synced");
      } else {
        toast.error("Sync failed");
      }
    } catch (error) {
      toast.error("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleCopyShareLink = () => {
    if (googleConnection.shareLink) {
      navigator.clipboard.writeText(googleConnection.shareLink);
      toast.success("Share link copied! Send this to your partner.");
    }
  };

  // ============================================================================
  // CONVERT TO FULLCALENDAR FORMAT
  // ============================================================================
  const calendarEvents: EventInput[] = useMemo(() => {
    return events.map(event => ({
      id: event.id,
      title: event.title,
      start: event.startTime,
      end: event.endTime,
      allDay: event.allDay,
      backgroundColor: event.color || CATEGORY_CONFIG[event.category].color,
      borderColor: event.color || CATEGORY_CONFIG[event.category].color,
      extendedProps: {
        description: event.description,
        location: event.location,
        category: event.category,
        syncStatus: event.syncStatus,
      },
    }));
  }, [events]);

  // Add wedding date as a special event
  if (weddingDate) {
    calendarEvents.push({
      id: "wedding-day",
      title: "Wedding Day!",
      start: weddingDate,
      allDay: true,
      backgroundColor: "#EC4899",
      borderColor: "#EC4899",
      classNames: ["wedding-day-event"],
    });
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow-lg">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 md:p-8 border-b border-warm-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/30 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-100/30 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-light tracking-wide text-warm-800">
                  {page.title}
                </h2>
                <p className="text-warm-500 text-sm mt-1">
                  Plan every moment of your wedding journey
                </p>
              </div>

              <div className="flex items-center gap-2">
                {googleConnection.connected ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Synced
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSyncNow}
                      disabled={syncing}
                      className="bg-white/70"
                    >
                      <RefreshCw className={`w-4 h-4 mr-1.5 ${syncing ? "animate-spin" : ""}`} />
                      Sync
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleConnectGoogle}
                    className="bg-white/70"
                  >
                    <CalendarIcon className="w-4 h-4 mr-1.5" />
                    Connect Google
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettingsModal(true)}
                  className="bg-white/70"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Wedding Countdown */}
            {daysUntilWedding !== null && daysUntilWedding > 0 && (
              <div className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-light text-warm-800">{daysUntilWedding}</p>
                  <p className="text-xs uppercase tracking-wider text-warm-500">days to go</p>
                </div>
                {weddingDate && (
                  <div className="ml-auto text-right">
                    <p className="text-sm font-medium text-warm-700">
                      {format(weddingDate, "EEEE, MMMM d, yyyy")}
                    </p>
                    <p className="text-xs text-warm-500">Your wedding day</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="px-6 py-4 border-b border-warm-200 bg-warm-50/50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const cal = document.querySelector(".fc") as HTMLElement & { 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    _calendar?: any 
                  };
                  cal?._calendar?.prev();
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const cal = document.querySelector(".fc") as HTMLElement & { 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    _calendar?: any 
                  };
                  cal?._calendar?.today();
                }}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const cal = document.querySelector(".fc") as HTMLElement & { 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    _calendar?: any 
                  };
                  cal?._calendar?.next();
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* View Switcher */}
            <div className="flex items-center gap-1 bg-white rounded-lg border border-warm-200 p-1">
              {VIEW_OPTIONS.map(view => (
                <button
                  key={view.value}
                  onClick={() => setCurrentView(view.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    currentView === view.value
                      ? "bg-warm-800 text-white"
                      : "text-warm-600 hover:bg-warm-100"
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>

            {/* Add Event Button */}
            <Button
              onClick={() => {
                resetNewEvent();
                setNewEvent(prev => ({
                  ...prev,
                  startDate: format(new Date(), "yyyy-MM-dd"),
                }));
                setSelectedEvent(null);
                setIsEditing(false);
                setShowEventModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Calendar */}
        <div className="p-4 md:p-6">
          {loading ? (
            <div className="h-[600px] flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-warm-400 animate-spin" />
            </div>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              initialView={currentView}
              headerToolbar={false}
              events={calendarEvents}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={3}
              weekends={fields.showWeekends !== false}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              height="auto"
              contentHeight={600}
              eventContent={(eventInfo) => (
                <div className="px-1 py-0.5 truncate">
                  <span className="text-xs font-medium">{eventInfo.event.title}</span>
                </div>
              )}
            />
          )}
        </div>

        {/* Category Legend */}
        <div className="px-6 py-4 border-t border-warm-200 bg-warm-50/50">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs text-warm-500 uppercase tracking-wider">Categories:</span>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs text-warm-600">{config.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Related Templates */}
        <div className="p-6 pt-0">
          <RelatedTemplates
            templateIds={["task-board", "day-of-schedule", "vendor-contacts"]}
            allPages={allPages}
            title="Related"
          />
        </div>
      </div>

      {/* Event Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                {selectedEvent && !isEditing ? (
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                ) : (
                  <Plus className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <span>
                {selectedEvent && !isEditing
                  ? "Event Details"
                  : selectedEvent
                  ? "Edit Event"
                  : "New Event"}
              </span>
            </DialogTitle>
          </DialogHeader>

          {selectedEvent && !isEditing ? (
            // View mode
            <div className="py-4 space-y-4">
              <div>
                <h3 className="text-lg font-medium text-warm-800">{selectedEvent.title}</h3>
                {selectedEvent.description && (
                  <p className="text-sm text-warm-600 mt-1">{selectedEvent.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-warm-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {format(parseISO(selectedEvent.startTime), selectedEvent.allDay ? "EEEE, MMMM d" : "EEEE, MMMM d 'at' h:mm a")}
                    {selectedEvent.endTime && !selectedEvent.allDay && (
                      <> - {format(parseISO(selectedEvent.endTime), "h:mm a")}</>
                    )}
                  </span>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center gap-2 text-sm text-warm-600">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Tag className="w-4 h-4 text-warm-400" />
                  <span
                    className="px-2 py-0.5 rounded-full text-xs text-white"
                    style={{ backgroundColor: CATEGORY_CONFIG[selectedEvent.category].color }}
                  >
                    {CATEGORY_CONFIG[selectedEvent.category].label}
                  </span>
                </div>

                {selectedEvent.syncStatus === "synced" && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="w-4 h-4" />
                    <span>Synced with Google Calendar</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-warm-200">
                <Button variant="outline" onClick={() => setIsEditing(true)} className="flex-1">
                  <Edit className="w-4 h-4 mr-1.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDeleteEvent}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            // Edit/Create mode
            <div className="py-4 space-y-4">
              <div>
                <Label className="text-sm text-warm-600">Event Title</Label>
                <Input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Venue Tour"
                  className="mt-1.5"
                  autoFocus
                />
              </div>

              <div>
                <Label className="text-sm text-warm-600">Description</Label>
                <Textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional details..."
                  className="mt-1.5"
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={newEvent.allDay}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, allDay: e.target.checked }))}
                  className="w-4 h-4 border-warm-300 rounded"
                />
                <Label htmlFor="allDay" className="text-sm text-warm-600">All day event</Label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-warm-600">Start Date</Label>
                  <Input
                    type="date"
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                {!newEvent.allDay && (
                  <div>
                    <Label className="text-sm text-warm-600">Start Time</Label>
                    <Input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
                      className="mt-1.5"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-warm-600">End Date</Label>
                  <Input
                    type="date"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                {!newEvent.allDay && (
                  <div>
                    <Label className="text-sm text-warm-600">End Time</Label>
                    <Input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
                      className="mt-1.5"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm text-warm-600">Location</Label>
                <Input
                  value={newEvent.location}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Grand Ballroom, 123 Main St"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="text-sm text-warm-600">Category</Label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setNewEvent(prev => ({ ...prev, category: key as EventCategory }))}
                      className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                        newEvent.category === key
                          ? "border-2"
                          : "border-warm-200 hover:border-warm-300"
                      }`}
                      style={{
                        borderColor: newEvent.category === key ? config.color : undefined,
                        backgroundColor: newEvent.category === key ? `${config.color}10` : undefined,
                      }}
                    >
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-1.5"
                        style={{ backgroundColor: config.color }}
                      />
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-warm-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedEvent) {
                      setIsEditing(false);
                    } else {
                      setShowEventModal(false);
                    }
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEvent}
                  disabled={!newEvent.title.trim() || !newEvent.startDate}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {selectedEvent ? "Save Changes" : "Create Event"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-warm-100 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-warm-600" />
              </div>
              <span>Calendar Settings</span>
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-6">
            {/* Google Calendar Connection */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-warm-700">Google Calendar</h4>

              {googleConnection.connected ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Connected</p>
                        <p className="text-xs text-green-600">{googleConnection.email}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleDisconnectGoogle}>
                      <Unlink className="w-4 h-4" />
                    </Button>
                  </div>

                  {googleConnection.calendarName && (
                    <div className="p-3 bg-warm-50 rounded-lg">
                      <p className="text-xs text-warm-500 uppercase tracking-wider mb-1">Wedding Calendar</p>
                      <p className="text-sm font-medium text-warm-700">{googleConnection.calendarName}</p>
                    </div>
                  )}

                  {googleConnection.shareLink && (
                    <div className="space-y-2">
                      <p className="text-xs text-warm-500">Share with your partner:</p>
                      <div className="flex gap-2">
                        <Input
                          value={googleConnection.shareLink}
                          readOnly
                          className="text-xs"
                        />
                        <Button variant="outline" size="sm" onClick={handleCopyShareLink}>
                          <Link2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {googleConnection.lastSyncAt && (
                    <p className="text-xs text-warm-500">
                      Last synced: {format(parseISO(googleConnection.lastSyncAt), "MMM d 'at' h:mm a")}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-warm-600">
                    Connect your Google Calendar to sync events and share with your partner.
                  </p>
                  <Button onClick={handleConnectGoogle} className="w-full">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Connect Google Calendar
                  </Button>
                </div>
              )}
            </div>

            {/* Display Settings */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-warm-700">Display</h4>

              <div className="flex items-center justify-between">
                <Label htmlFor="showWeekends" className="text-sm text-warm-600">
                  Show weekends
                </Label>
                <input
                  type="checkbox"
                  id="showWeekends"
                  checked={fields.showWeekends !== false}
                  onChange={(e) => updateField("showWeekends", e.target.checked)}
                  className="w-4 h-4 border-warm-300 rounded"
                />
              </div>

              <div>
                <Label className="text-sm text-warm-600">Default View</Label>
                <select
                  value={(fields.defaultView as string) || "dayGridMonth"}
                  onChange={(e) => updateField("defaultView", e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 border border-warm-300 rounded-lg text-sm"
                >
                  {VIEW_OPTIONS.map(view => (
                    <option key={view.value} value={view.value}>{view.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <Button variant="outline" onClick={() => setShowSettingsModal(false)} className="w-full">
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
