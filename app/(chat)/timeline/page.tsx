"use client";

import { usePlannerData, TimelineEvent } from "@/lib/hooks/usePlannerData";

export default function TimelinePage() {
  const { data, loading } = usePlannerData();

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex items-center gap-2 text-ink-soft">
          <div className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" />
          <div className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  const events = data?.timeline?.events || [];
  const hasData = events.length > 0;
  const weddingDate = data?.summary?.weddingDate;

  // Sort events by time
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = a.time || "00:00";
    const timeB = b.time || "00:00";
    return timeA.localeCompare(timeB);
  });

  // Group by category (prep, ceremony, reception, etc.)
  const groupedEvents = sortedEvents.reduce((acc, event) => {
    const category = event.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  const categoryOrder = ["Prep", "Ceremony", "Cocktail Hour", "Reception", "Other"];
  const orderedCategories = categoryOrder.filter(cat => groupedEvents[cat]?.length > 0);
  // Add any categories not in the predefined order
  Object.keys(groupedEvents).forEach(cat => {
    if (!orderedCategories.includes(cat)) orderedCategories.push(cat);
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-ink mb-1">Wedding Day Timeline</h1>
        <p className="text-ink-soft">
          {weddingDate 
            ? `Your schedule for ${new Date(weddingDate).toLocaleDateString("en-US", { 
                weekday: "long", 
                month: "long", 
                day: "numeric", 
                year: "numeric" 
              })}`
            : "Your day-of schedule"
          }
        </p>
      </div>

      {!hasData ? (
        /* Empty state */
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-medium text-ink text-xl mb-2">No timeline events yet</h2>
          <p className="text-ink-soft mb-6">
            Tell me about your wedding day schedule in chat and I&apos;ll build your timeline.
          </p>
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors"
          >
            Go to chat
          </a>

          {/* Sample timeline hint */}
          <div className="mt-8 p-4 bg-stone-50 rounded-xl text-left">
            <p className="text-sm font-medium text-ink mb-2">Example things to tell me:</p>
            <ul className="text-sm text-ink-soft space-y-1">
              <li>&quot;Ceremony starts at 4pm&quot;</li>
              <li>&quot;Hair and makeup from 10am to 1pm&quot;</li>
              <li>&quot;First dance right after dinner&quot;</li>
              <li>&quot;We want to do a sparkler exit at 10pm&quot;</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          {/* Timeline view */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-stone-200" />

            {orderedCategories.map((category) => (
              <div key={category} className="mb-8">
                {/* Category header */}
                <div className="flex items-center gap-3 mb-4 relative">
                  <div className="w-12 h-12 rounded-full bg-rose-100 border-4 border-white flex items-center justify-center z-10">
                    {getCategoryIcon(category)}
                  </div>
                  <h2 className="font-medium text-lg text-ink">{category}</h2>
                </div>

                {/* Events in this category */}
                <div className="ml-14 space-y-3">
                  {groupedEvents[category].map((event) => (
                    <TimelineEventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Help prompt */}
          <div className="mt-6 p-4 bg-stone-50 rounded-xl text-center">
            <p className="text-sm text-ink-soft">
              Need to add or adjust your timeline?{" "}
              <a href="/" className="text-rose-600 hover:text-rose-700 font-medium">
                Tell me in chat
              </a>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function getCategoryIcon(category: string) {
  const iconClass = "w-5 h-5 text-rose-500";
  switch (category.toLowerCase()) {
    case "prep":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      );
    case "ceremony":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      );
    case "cocktail hour":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-.772.129a13.033 13.033 0 01-10.725 0l-.772-.13c-1.717-.292-2.3-2.378-1.067-3.61L5 14.5" />
        </svg>
      );
    case "reception":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

function TimelineEventCard({ event }: { event: TimelineEvent }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 hover:border-stone-300 transition-colors">
      <div className="flex items-start gap-4">
        {/* Time */}
        <div className="flex-shrink-0 w-16 text-right">
          <p className="font-medium text-ink">{formatTime(event.time)}</p>
          {event.duration && (
            <p className="text-xs text-ink-faint">{event.duration} min</p>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-ink">{event.title}</h3>
          {event.description && (
            <p className="text-sm text-ink-soft mt-1">{event.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {event.location && (
              <span className="inline-flex items-center gap-1 text-xs text-ink-faint">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {event.location}
              </span>
            )}
            {event.vendor && (
              <span className="inline-flex items-center gap-1 text-xs text-ink-faint">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                {event.vendor}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(time: string): string {
  if (!time) return "";
  
  // Handle already formatted times
  if (time.includes("AM") || time.includes("PM") || time.includes("am") || time.includes("pm")) {
    return time;
  }
  
  // Parse 24h format
  const [hours, minutes] = time.split(":").map(Number);
  if (isNaN(hours)) return time;
  
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes?.toString().padStart(2, "0") || "00";
  
  return `${displayHours}:${displayMinutes} ${period}`;
}
