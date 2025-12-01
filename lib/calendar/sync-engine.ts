import { calendar_v3 } from "googleapis";
import {
  getCalendarEventsByTenantId,
  getCalendarEventByGoogleId,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getGoogleCalendarConnection,
  updateGoogleCalendarConnection,
  createCalendarSyncLog,
} from "@/lib/db/queries";
import {
  listGoogleEvents,
  createGoogleEvent,
  updateGoogleEvent,
  deleteGoogleEvent,
} from "./google-client";
import type { CalendarEvent, NewCalendarEvent } from "@/lib/db/schema";

// ============================================================================
// TYPES
// ============================================================================

interface SyncResult {
  success: boolean;
  pushed: number;
  pulled: number;
  deleted: number;
  errors: string[];
}

// ============================================================================
// MAIN SYNC FUNCTION
// ============================================================================

export async function syncCalendar(tenantId: string): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    pushed: 0,
    pulled: 0,
    deleted: 0,
    errors: [],
  };

  try {
    const connection = await getGoogleCalendarConnection(tenantId);

    if (!connection || !connection.syncEnabled) {
      return { ...result, success: false, errors: ["No active Google Calendar connection"] };
    }

    // 1. Push local changes to Google
    const pushResult = await pushToGoogle(tenantId, connection.weddingCalendarId);
    result.pushed = pushResult.pushed;
    result.errors.push(...pushResult.errors);

    // 2. Pull changes from Google
    const pullResult = await pullFromGoogle(
      tenantId,
      connection.weddingCalendarId,
      connection.syncToken || undefined
    );
    result.pulled = pullResult.pulled;
    result.deleted = pullResult.deleted;
    result.errors.push(...pullResult.errors);

    // 3. Update sync token and timestamp
    if (pullResult.nextSyncToken) {
      await updateGoogleCalendarConnection(tenantId, {
        syncToken: pullResult.nextSyncToken,
        lastSyncAt: new Date(),
      });
    }

    // Log the sync
    await createCalendarSyncLog(
      tenantId,
      "sync",
      result.errors.length === 0 ? "success" : "partial",
      undefined,
      undefined,
      { pushed: result.pushed, pulled: result.pulled, deleted: result.deleted }
    );

    result.success = result.errors.length === 0;
  } catch (error) {
    console.error("Calendar sync failed:", error);
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : "Unknown error");

    await createCalendarSyncLog(
      tenantId,
      "sync",
      "failed",
      undefined,
      undefined,
      { error: result.errors[0] }
    );
  }

  return result;
}

// ============================================================================
// PUSH TO GOOGLE
// ============================================================================

async function pushToGoogle(
  tenantId: string,
  calendarId: string
): Promise<{ pushed: number; errors: string[] }> {
  const result = { pushed: 0, errors: [] as string[] };

  try {
    // Get all local events that need syncing
    const localEvents = await getCalendarEventsByTenantId(tenantId);
    const pendingEvents = localEvents.filter(
      (e) => e.syncStatus === "local" || e.syncStatus === "pending"
    );

    for (const event of pendingEvents) {
      try {
        if (!event.googleEventId) {
          // Create new event in Google
          const { googleEventId, etag } = await createGoogleEvent(
            tenantId,
            calendarId,
            {
              title: event.title,
              description: event.description || undefined,
              startTime: event.startTime,
              endTime: event.endTime || undefined,
              allDay: event.allDay,
              location: event.location || undefined,
            }
          );

          await updateCalendarEvent(event.id, tenantId, {
            googleEventId,
            googleCalendarId: calendarId,
            googleEtag: etag,
            syncStatus: "synced",
            lastSyncedAt: new Date(),
          });

          result.pushed++;
        } else if (event.syncStatus === "pending") {
          // Update existing event in Google
          const { etag } = await updateGoogleEvent(
            tenantId,
            calendarId,
            event.googleEventId,
            {
              title: event.title,
              description: event.description || undefined,
              startTime: event.startTime,
              endTime: event.endTime || undefined,
              allDay: event.allDay,
              location: event.location || undefined,
            }
          );

          await updateCalendarEvent(event.id, tenantId, {
            googleEtag: etag,
            syncStatus: "synced",
            lastSyncedAt: new Date(),
          });

          result.pushed++;
        }
      } catch (error) {
        console.error(`Failed to push event ${event.id}:`, error);
        result.errors.push(`Failed to sync "${event.title}"`);

        await updateCalendarEvent(event.id, tenantId, {
          syncStatus: "error",
        });
      }
    }
  } catch (error) {
    console.error("Push to Google failed:", error);
    result.errors.push("Failed to push events to Google");
  }

  return result;
}

// ============================================================================
// PULL FROM GOOGLE
// ============================================================================

async function pullFromGoogle(
  tenantId: string,
  calendarId: string,
  syncToken?: string
): Promise<{
  pulled: number;
  deleted: number;
  errors: string[];
  nextSyncToken?: string;
}> {
  const result = {
    pulled: 0,
    deleted: 0,
    errors: [] as string[],
    nextSyncToken: undefined as string | undefined,
  };

  try {
    const { events, nextSyncToken } = await listGoogleEvents(
      tenantId,
      calendarId,
      syncToken
    );

    result.nextSyncToken = nextSyncToken;

    for (const googleEvent of events) {
      try {
        if (!googleEvent.id) continue;

        // Check if event was deleted
        if (googleEvent.status === "cancelled") {
          const existing = await getCalendarEventByGoogleId(googleEvent.id, tenantId);
          if (existing) {
            await deleteCalendarEvent(existing.id, tenantId);
            result.deleted++;
          }
          continue;
        }

        // Check if we already have this event
        const existing = await getCalendarEventByGoogleId(googleEvent.id, tenantId);

        if (existing) {
          // Update if Google version is newer (based on etag)
          if (existing.googleEtag !== googleEvent.etag) {
            const eventData = mapGoogleEventToLocal(googleEvent, tenantId, calendarId);
            await updateCalendarEvent(existing.id, tenantId, {
              ...eventData,
              googleEtag: googleEvent.etag || undefined,
              syncStatus: "synced",
              lastSyncedAt: new Date(),
            });
            result.pulled++;
          }
        } else {
          // Create new local event
          const eventData = mapGoogleEventToLocal(googleEvent, tenantId, calendarId);
          await createCalendarEvent({
            ...eventData,
            googleEventId: googleEvent.id,
            googleEtag: googleEvent.etag || undefined,
            syncStatus: "synced",
            lastSyncedAt: new Date(),
          } as NewCalendarEvent);
          result.pulled++;
        }
      } catch (error) {
        console.error(`Failed to pull event ${googleEvent.id}:`, error);
        result.errors.push(`Failed to sync "${googleEvent.summary || "Untitled"}"`);
      }
    }
  } catch (error) {
    console.error("Pull from Google failed:", error);
    result.errors.push("Failed to pull events from Google");
  }

  return result;
}

// ============================================================================
// HELPERS
// ============================================================================

function mapGoogleEventToLocal(
  googleEvent: calendar_v3.Schema$Event,
  tenantId: string,
  calendarId: string
): Partial<CalendarEvent> {
  const isAllDay = !!googleEvent.start?.date;

  let startTime: Date;
  let endTime: Date | null = null;

  if (isAllDay) {
    startTime = new Date(googleEvent.start?.date + "T00:00:00");
    if (googleEvent.end?.date) {
      endTime = new Date(googleEvent.end.date + "T23:59:59");
    }
  } else {
    startTime = new Date(googleEvent.start?.dateTime || new Date());
    if (googleEvent.end?.dateTime) {
      endTime = new Date(googleEvent.end.dateTime);
    }
  }

  return {
    tenantId,
    title: googleEvent.summary || "Untitled Event",
    description: googleEvent.description || null,
    startTime,
    endTime,
    allDay: isAllDay,
    location: googleEvent.location || null,
    category: "other", // Can't infer category from Google
    color: null,
    googleCalendarId: calendarId,
  };
}

// ============================================================================
// SINGLE EVENT SYNC
// ============================================================================

export async function syncSingleEventToGoogle(
  tenantId: string,
  eventId: string
): Promise<boolean> {
  try {
    const connection = await getGoogleCalendarConnection(tenantId);
    if (!connection) return false;

    const localEvents = await getCalendarEventsByTenantId(tenantId);
    const event = localEvents.find((e) => e.id === eventId);
    if (!event) return false;

    if (!event.googleEventId) {
      // Create in Google
      const { googleEventId, etag } = await createGoogleEvent(
        tenantId,
        connection.weddingCalendarId,
        {
          title: event.title,
          description: event.description || undefined,
          startTime: event.startTime,
          endTime: event.endTime || undefined,
          allDay: event.allDay,
          location: event.location || undefined,
        }
      );

      await updateCalendarEvent(event.id, tenantId, {
        googleEventId,
        googleCalendarId: connection.weddingCalendarId,
        googleEtag: etag,
        syncStatus: "synced",
        lastSyncedAt: new Date(),
      });
    } else {
      // Update in Google
      const { etag } = await updateGoogleEvent(
        tenantId,
        connection.weddingCalendarId,
        event.googleEventId,
        {
          title: event.title,
          description: event.description || undefined,
          startTime: event.startTime,
          endTime: event.endTime || undefined,
          allDay: event.allDay,
          location: event.location || undefined,
        }
      );

      await updateCalendarEvent(event.id, tenantId, {
        googleEtag: etag,
        syncStatus: "synced",
        lastSyncedAt: new Date(),
      });
    }

    return true;
  } catch (error) {
    console.error("Failed to sync single event:", error);
    return false;
  }
}

export async function deleteSyncedEventFromGoogle(
  tenantId: string,
  googleEventId: string,
  calendarId: string
): Promise<boolean> {
  try {
    await deleteGoogleEvent(tenantId, calendarId, googleEventId);
    return true;
  } catch (error) {
    console.error("Failed to delete event from Google:", error);
    return false;
  }
}
