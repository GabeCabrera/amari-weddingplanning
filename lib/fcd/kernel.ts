/**
 * Wedding Kernel - Compressed Conversation State
 * π-ID: 3.14159.6
 * 
 * Instead of storing full conversations, we extract and maintain
 * a compressed "kernel" of the wedding state. The AI can decompress
 * this into rich context when needed.
 */

// The core wedding kernel - everything the AI needs to know
export interface WeddingKernel {
  // Identity
  id: string;
  names: [string, string];           // ["Sarah", "Mike"]
  
  // Timeline
  weddingDate?: string;              // ISO date
  engagementDate?: string;
  planningPhase: "dreaming" | "early" | "mid" | "final" | "week_of" | "post";
  
  // Scale
  guestCount?: number;
  budgetTotal?: number;
  budgetSpent?: number;
  
  // Preferences (extracted from conversation)
  vibe: string[];                    // ["rustic", "outdoor", "intimate"]
  priorities: string[];              // ["photography", "food", "music"]
  dealbreakers: string[];            // ["no_buffet", "must_have_band"]
  
  // Stress points (what they're worried about)
  stressors: string[];               // ["seating", "family_drama", "budget"]
  
  // Decisions made
  decisions: {
    venue?: { name: string; locked: boolean };
    photographer?: { name: string; locked: boolean };
    caterer?: { name: string; locked: boolean };
    // ... other vendors
  };
  
  // Conversation patterns
  tone: "excited" | "anxious" | "overwhelmed" | "calm" | "frustrated";
  communicationStyle: "detailed" | "brief" | "emotional" | "practical";
  
  // What they've asked about recently (for continuity)
  recentTopics: string[];
  
  // Timestamps
  lastInteraction: string;
  createdAt: string;
}

// Kernel update - what changed in a conversation turn
export interface KernelDelta {
  field: keyof WeddingKernel;
  previous: unknown;
  current: unknown;
  confidence: number;  // 0-1, how sure are we about this extraction
  source: string;      // The message that caused this update
}

// Extract kernel updates from a conversation turn
export function extractKernelDelta(
  currentKernel: WeddingKernel,
  userMessage: string,
  aiResponse: string
): KernelDelta[] {
  // This would use AI to extract structured updates
  // For now, placeholder
  return [];
}

import { formatDate } from "../utils";

// Decompress kernel into natural language context for the AI
export function decompressKernel(kernel: WeddingKernel): string {
  const lines: string[] = [];
  
  lines.push(`You're helping ${kernel.names[0]} and ${kernel.names[1]} plan their wedding.`);
  
  if (kernel.weddingDate) {
    const date = new Date(kernel.weddingDate);
    const now = new Date();
    const months = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
    lines.push(`Their wedding is ${formatDate(date, "en-US")}, about ${months} months away.`);
  }
  
  if (kernel.guestCount) {
    lines.push(`They're planning for around ${kernel.guestCount} guests.`);
  }
  
  if (kernel.budgetTotal) {
    const remaining = kernel.budgetTotal - (kernel.budgetSpent || 0);
    lines.push(`Budget is $${kernel.budgetTotal.toLocaleString()}, with $${remaining.toLocaleString()} remaining.`);
  }
  
  if (kernel.vibe.length > 0) {
    lines.push(`They want a ${kernel.vibe.join(", ")} vibe.`);
  }
  
  if (kernel.stressors.length > 0) {
    lines.push(`They're stressed about: ${kernel.stressors.join(", ")}.`);
  }
  
  if (kernel.tone === "overwhelmed" || kernel.tone === "anxious") {
    lines.push(`They seem ${kernel.tone} right now, so be extra supportive.`);
  }
  
  if (kernel.recentTopics.length > 0) {
    lines.push(`Recently discussed: ${kernel.recentTopics.slice(-3).join(", ")}.`);
  }
  
  return lines.join(" ");
}

// Create empty kernel for new users
export function createEmptyKernel(id: string, names: [string, string]): WeddingKernel {
  return {
    id,
    names,
    planningPhase: "early",
    vibe: [],
    priorities: [],
    dealbreakers: [],
    stressors: [],
    decisions: {},
    tone: "excited",
    communicationStyle: "practical",
    recentTopics: [],
    lastInteraction: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}
