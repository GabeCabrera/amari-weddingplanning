/**
 * Google Calendar API Client
 * 
 * Uses the OAuth token service for automatic token management.
 * Tokens are automatically refreshed when expired.
 */

import { getOAuthTokens, hasScope } from "@/lib/auth/oauth-tokens";

const CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";

// Required scopes for different operations
const SCOPES = {
  READ_CALENDARS: "https://www.googleapis.com/auth/calendar.readonly",
  READ_WRITE_EVENTS: "https://www.googleapis.com/auth/calendar.events",
};

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  colorId?: string;
  reminders?: {
    useDefault: boolean;
    overrides?: { method: string; minutes: number }[];
  };
}

export interface CalendarListEntry {
  id: string;
  summary: string;
  primary?: boolean;
  backgroundColor?: string;
  accessRole: string;
}

type CalendarResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; needsReauth: boolean };

/**
 * Make an authenticated request to Google Calendar API
 */
async function calendarFetch<T>(
  userId: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<CalendarResult<T>> {
  // Get valid tokens (auto-refreshes if needed)
  const tokenResult = await getOAuthTokens(userId, "google");
  
  if (!tokenResult.success) {
    return {
      success: false,
      error: tokenResult.error,
      needsReauth: tokenResult.needsReauth,
    };
  }

  const response = await fetch(`${CALENDAR_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${tokenResult.tokens.accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Google Calendar API error:", error);
    
    // 401 means token is invalid despite our refresh attempt
    if (response.status === 401) {
      return {
        success: false,
        error: "Google authentication failed. Please reconnect your account.",
        needsReauth: true,
      };
    }

    return {
      success: false,
      error: `Calendar API error: ${response.status}`,
      needsReauth: false,
    };
  }

  const data = await response.json();
  return { success: true, data };
}

/**
 * List all calendars the user has access to
 */
export async function listCalendars(userId: string): Promise<CalendarResult<CalendarListEntry[]>> {
  const result = await calendarFetch<{ items: CalendarListEntry[] }>(
    userId,
    "/users/me/calendarList"
  );

  if (!result.success) return result;
  return { success: true, data: result.data.items || [] };
}

/**
 * Get events from a calendar
 */
export async function getCalendarEvents(
  userId: string,
  calendarId: string = "primary",
  options: {
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    singleEvents?: boolean;
    orderBy?: "startTime" | "updated";
  } = {}
): Promise<CalendarResult<GoogleCalendarEvent[]>> {
  const params = new URLSearchParams({
    singleEvents: String(options.singleEvents ?? true),
    orderBy: options.orderBy || "startTime",
    maxResults: String(options.maxResults || 100),
  });

  if (options.timeMin) params.set("timeMin", options.timeMin);
  if (options.timeMax) params.set("timeMax", options.timeMax);

  const result = await calendarFetch<{ items: GoogleCalendarEvent[] }>(
    userId,
    `/calendars/${encodeURIComponent(calendarId)}/events?${params}`
  );

  if (!result.success) return result;
  return { success: true, data: result.data.items || [] };
}

/**
 * Create a new calendar event
 */
export async function createCalendarEvent(
  userId: string,
  event: GoogleCalendarEvent,
  calendarId: string = "primary"
): Promise<CalendarResult<GoogleCalendarEvent>> {
  return calendarFetch<GoogleCalendarEvent>(
    userId,
    `/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      body: JSON.stringify(event),
    }
  );
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(
  userId: string,
  eventId: string,
  event: Partial<GoogleCalendarEvent>,
  calendarId: string = "primary"
): Promise<CalendarResult<GoogleCalendarEvent>> {
  return calendarFetch<GoogleCalendarEvent>(
    userId,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(event),
    }
  );
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(
  userId: string,
  eventId: string,
  calendarId: string = "primary"
): Promise<CalendarResult<void>> {
  const tokenResult = await getOAuthTokens(userId, "google");
  
  if (!tokenResult.success) {
    return {
      success: false,
      error: tokenResult.error,
      needsReauth: tokenResult.needsReauth,
    };
  }

  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${tokenResult.tokens.accessToken}`,
      },
    }
  );

  if (!response.ok && response.status !== 204) {
    return {
      success: false,
      error: `Failed to delete event: ${response.status}`,
      needsReauth: response.status === 401,
    };
  }

  return { success: true, data: undefined };
}

/**
 * Create a new calendar (e.g., a dedicated "Wedding Planning" calendar)
 */
export async function createCalendar(
  userId: string,
  summary: string,
  description?: string
): Promise<CalendarResult<CalendarListEntry>> {
  return calendarFetch<CalendarListEntry>(
    userId,
    "/calendars",
    {
      method: "POST",
      body: JSON.stringify({
        summary,
        description,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    }
  );
}

/**
 * Quick check if user has Google Calendar connected with proper scopes
 */
export async function hasCalendarAccess(userId: string): Promise<{
  connected: boolean;
  hasReadAccess: boolean;
  hasWriteAccess: boolean;
  needsReauth: boolean;
}> {
  const tokenResult = await getOAuthTokens(userId, "google");

  if (!tokenResult.success) {
    return {
      connected: false,
      hasReadAccess: false,
      hasWriteAccess: false,
      needsReauth: tokenResult.needsReauth,
    };
  }

  const scope = tokenResult.tokens.scope;
  
  return {
    connected: true,
    hasReadAccess: hasScope(scope, SCOPES.READ_CALENDARS),
    hasWriteAccess: hasScope(scope, SCOPES.READ_WRITE_EVENTS),
    needsReauth: false,
  };
}
