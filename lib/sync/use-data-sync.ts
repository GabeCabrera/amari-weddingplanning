"use client";

import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

// Event types for different data changes
export type DataChangeType = 
  | "guest_list"
  | "budget"
  | "vendors"
  | "timeline"
  | "tasks"
  | "rsvp"
  | "all";

export interface DataChangeEvent {
  type: DataChangeType;
  action: "create" | "update" | "delete" | "sync";
  pageId?: string;
  data?: unknown;
  timestamp: number;
}

const CHANNEL_NAME = "scribe-data-sync";

/**
 * Hook to listen for data changes from other parts of the app (like AI chat)
 * and trigger refreshes when needed.
 */
export function useDataSync(
  onRefresh: () => void | Promise<void>,
  filterTypes?: DataChangeType[]
) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    // Initialize BroadcastChannel for cross-tab sync
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        channelRef.current = new BroadcastChannel(CHANNEL_NAME);
      } catch (e) {
        console.warn("BroadcastChannel not available:", e);
      }
    }

    const handleEvent = (event: DataChangeEvent) => {
      // Check if this event type should trigger a refresh
      const shouldRefresh = !filterTypes || 
        filterTypes.includes(event.type) || 
        filterTypes.includes("all");
      
      if (shouldRefresh) {
        console.log("[DataSync] Refreshing due to:", event);
        onRefreshRef.current();
      }
    };

    // Listen to custom events (same-tab)
    const customEventHandler = (e: Event) => {
      handleEvent((e as CustomEvent<DataChangeEvent>).detail);
    };
    window.addEventListener("scribe-data-change", customEventHandler);

    // Listen to BroadcastChannel (cross-tab)
    const channelHandler = (e: MessageEvent<DataChangeEvent>) => {
      handleEvent(e.data);
    };
    if (channelRef.current) {
      channelRef.current.addEventListener("message", channelHandler);
    }

    return () => {
      window.removeEventListener("scribe-data-change", customEventHandler);
      if (channelRef.current) {
        channelRef.current.removeEventListener("message", channelHandler);
        channelRef.current.close();
      }
    };
  }, [filterTypes?.join(",")]);
}

/**
 * Function to broadcast a data change event
 * Call this after AI tools make changes
 */
export function broadcastDataChange(
  type: DataChangeType,
  action: DataChangeEvent["action"],
  pageId?: string,
  data?: unknown
): void {
  const event: DataChangeEvent = {
    type,
    action,
    pageId,
    data,
    timestamp: Date.now(),
  };

  // Dispatch custom event (same-tab)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("scribe-data-change", { detail: event }));
  }

  // Broadcast via BroadcastChannel (cross-tab)
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage(event);
      channel.close();
    } catch (e) {
      console.warn("Failed to broadcast:", e);
    }
  }
}

/**
 * Hook for polling-based sync (fallback for when BroadcastChannel doesn't work)
 * Checks for changes at a specified interval
 */
export function usePollingSync(
  checkForChanges: () => Promise<boolean>,
  onChangesDetected: () => void,
  intervalMs: number = 5000,
  enabled: boolean = true
) {
  const checkForChangesRef = useRef(checkForChanges);
  const onChangesDetectedRef = useRef(onChangesDetected);
  checkForChangesRef.current = checkForChanges;
  onChangesDetectedRef.current = onChangesDetected;

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(async () => {
      try {
        const hasChanges = await checkForChangesRef.current();
        if (hasChanges) {
          onChangesDetectedRef.current();
        }
      } catch (e) {
        // Silently ignore polling errors
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs, enabled]);
}

/**
 * API route to check for page updates
 * Returns the latest updatedAt timestamps for comparison
 */
export async function fetchPageTimestamps(): Promise<Record<string, string>> {
  try {
    const response = await fetch("/api/planner/pages/timestamps");
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn("Failed to fetch timestamps:", e);
  }
  return {};
}
