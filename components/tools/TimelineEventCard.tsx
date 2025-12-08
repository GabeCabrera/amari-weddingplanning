import React from "react";
import { TimelineEvent } from "@/lib/hooks/usePlannerData";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  MapPin, // Location icon
  User, // Person icon
} from "lucide-react";

// Moved formatTime out of the component for better testability and to fix `this` context
export function formatTime(time: string | undefined): string {
  if (!time) return "";

  try {
    const [hours, minutes] = time.split(":").map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      const date = new Date(); // Create a new Date object
      date.setHours(hours);
      date.setMinutes(minutes);
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
  } catch (e) {
    console.error("Failed to parse time with Intl:", e);
  }

  const parts = time.split(':');
  if (parts.length === 2) {
    let h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  }
  return time;
}

export default function TimelineEventCard({ event }: { event: TimelineEvent }) {
  return (
    <Card className="p-4 rounded-xl shadow-soft bg-white border border-border transition-all duration-300 hover:shadow-medium hover:translate-y-[-2px]">
      <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
        <div className="text-left sm:text-right sm:pr-4 border-b pb-2 sm:pb-0 sm:border-b-0 sm:border-r border-border/70">
          <CardTitle className="font-sans text-xl font-medium mb-0.5 text-foreground">
            {formatTime(event.time)}
          </CardTitle>
          {event.duration && (
            <p className="text-sm text-muted-foreground">
              {event.duration} min
            </p>
          )}
        </div>
        <div className="sm:col-span-2 sm:pl-4">
          <CardTitle className="font-sans text-lg font-medium mb-0.5 text-foreground">
            {event.title}
          </CardTitle>
          {event.description && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {event.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {event.location && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                <MapPin className="h-3 w-3" /> {event.location}
              </span>
            )}
            {event.vendor && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                <User className="h-3 w-3" /> {event.vendor}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
