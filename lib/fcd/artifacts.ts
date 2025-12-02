/**
 * Artifact System - Rich inline components
 * π-ID: 3.14159.5.2
 * 
 * When the AI needs to show data (guest list, budget, etc.),
 * it renders an artifact inline in the chat.
 */

export type ArtifactType = 
  | "budget"
  | "guests" 
  | "vendors"
  | "timeline"
  | "seating"
  | "checklist"
  | "schedule"
  | "table";  // Generic data table

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  data: unknown;
  editable: boolean;
  createdAt: string;
}

// Budget artifact data
export interface BudgetArtifactData {
  total: number;
  spent: number;
  categories: Array<{
    name: string;
    allocated: number;
    spent: number;
    items: Array<{
      name: string;
      amount: number;
      paid: boolean;
    }>;
  }>;
}

// Guest list artifact data
export interface GuestArtifactData {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  guests: Array<{
    id: string;
    name: string;
    email?: string;
    rsvp: "confirmed" | "declined" | "pending";
    plusOne: boolean;
    dietary?: string;
    table?: string;
  }>;
}

// Vendor artifact data
export interface VendorArtifactData {
  vendors: Array<{
    id: string;
    category: string;
    name: string;
    contact?: string;
    cost?: number;
    paid?: number;
    status: "researching" | "contacted" | "booked" | "paid";
    notes?: string;
  }>;
}

// Timeline artifact data
export interface TimelineArtifactData {
  weddingDate: string;
  tasks: Array<{
    id: string;
    title: string;
    dueDate: string;
    completed: boolean;
    category: string;
  }>;
}

// Checklist artifact data
export interface ChecklistArtifactData {
  title: string;
  items: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
}

// Day-of schedule artifact data
export interface ScheduleArtifactData {
  date: string;
  events: Array<{
    id: string;
    time: string;
    title: string;
    location?: string;
    notes?: string;
  }>;
}
