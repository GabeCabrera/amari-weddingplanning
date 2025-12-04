/**
 * Data Sync Utility
 * 
 * Enables real-time synchronization between AI chat actions and the planner UI.
 * When AI tools modify data, they broadcast an event that the planner listens to.
 */

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

// Use BroadcastChannel for cross-tab sync, with fallback to custom events
const CHANNEL_NAME = "aisle-data-sync";
let broadcastChannel: BroadcastChannel | null = null;

// Initialize broadcast channel if available
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  } catch (e) {
    console.warn("BroadcastChannel not available:", e);
  }
}

/**
 * Broadcast a data change event to all listeners
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

  // Broadcast via BroadcastChannel (cross-tab)
  if (broadcastChannel) {
    broadcastChannel.postMessage(event);
  }

  // Also dispatch a custom event (same-tab)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("aisle-data-change", { detail: event }));
  }
}

/**
 * Subscribe to data change events
 * Returns an unsubscribe function
 */
export function subscribeToDataChanges(
  callback: (event: DataChangeEvent) => void,
  filterTypes?: DataChangeType[]
): () => void {
  const handleEvent = (event: DataChangeEvent) => {
    if (!filterTypes || filterTypes.includes(event.type) || filterTypes.includes("all")) {
      callback(event);
    }
  };

  // Listen to custom events (same-tab)
  const customEventHandler = (e: Event) => {
    handleEvent((e as CustomEvent<DataChangeEvent>).detail);
  };
  window.addEventListener("aisle-data-change", customEventHandler);

  // Listen to BroadcastChannel (cross-tab)
  const channelHandler = (e: MessageEvent<DataChangeEvent>) => {
    handleEvent(e.data);
  };
  if (broadcastChannel) {
    broadcastChannel.addEventListener("message", channelHandler);
  }

  // Return unsubscribe function
  return () => {
    window.removeEventListener("aisle-data-change", customEventHandler);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener("message", channelHandler);
    }
  };
}
