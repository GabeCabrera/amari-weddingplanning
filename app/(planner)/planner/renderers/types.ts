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
