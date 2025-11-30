import { type Page } from "@/lib/db/schema";

// Base props that all renderers receive
export interface BaseRendererProps {
  page: Page;
  fields: Record<string, unknown>;
  updateField: (key: string, value: unknown) => void;
}

// Props for renderers that need access to all pages
export interface RendererWithAllPagesProps extends BaseRendererProps {
  allPages: Page[];
}

// Task Board Types
export interface Task {
  id: string;
  title: string;
  assignee: "partner1" | "partner2" | "both" | "unassigned";
  status: "todo" | "in-progress" | "done";
  color: "yellow" | "pink" | "blue" | "green" | "purple";
  dueDate?: string;
}

// Wedding Party Types
export interface PartyMember {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export type MessageGroup = "bridesmaids" | "groomsmen" | "others" | "all";
export type PartyGroup = "bridesmaids" | "groomsmen" | "others";

// Ceremony Script Types
export interface CeremonyElement {
  element: string;
  person: string;
  content: string;
  duration: string;
}

export interface Reading {
  title: string;
  author: string;
  reader: string;
  text: string;
}

// RSVP Types
export interface RsvpFormData {
  id: string;
  slug: string;
  isActive: boolean;
  fields: Record<string, boolean>;
  mealOptions: string[];
}

// Budget Types
export interface BudgetItem {
  id: string;
  category: string;
  vendor: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  totalCost: string;
  amountPaid: string;
  notes: string;
  payments?: Payment[];
  contractStatus?: "none" | "pending" | "signed" | "completed";
  depositDueDate?: string;
  finalPaymentDueDate?: string;
}

export interface Payment {
  id: string;
  amount: string;
  date: string;
  method: string;
  notes: string;
}

// Vendor Types (derived from Budget)
export interface Vendor {
  id: string;
  category: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  website?: string;
  address?: string;
  contractStatus: "none" | "pending" | "signed" | "completed";
  depositPaid: boolean;
  notes: string;
  // Linked from budget
  totalCost?: number;
  amountPaid?: number;
}

// Day-of Schedule Types
export interface ScheduleEvent {
  id: string;
  time: string;
  endTime?: string;
  event: string;
  location?: string;
  assignees: string[]; // Names or roles
  notes?: string;
  category: "prep" | "ceremony" | "reception" | "photos" | "other";
}

// Seating Chart Types
export interface Table {
  id: string;
  name: string; // e.g., "Table 1", "Head Table", "Family Table"
  shape: "round" | "rectangle" | "square" | "oval";
  capacity: number;
  guests: SeatedGuest[];
  x?: number; // Position for visual layout
  y?: number;
}

export interface SeatedGuest {
  id: string;
  name: string;
  meal?: string;
  dietaryRestrictions?: string;
  seatNumber?: number;
  // Reference to guest list
  guestListId?: string;
}

// Guest from Guest List (for reference)
export interface GuestListGuest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  rsvp: boolean;
  meal?: string;
  dietaryRestrictions?: string;
  plusOne?: boolean;
  plusOneName?: string;
}
