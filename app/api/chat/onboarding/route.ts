import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Anthropic from "@anthropic-ai/sdk";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { tenants, conciergeConversations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Onboarding Chat API
 * π-ID: 3.14159.7
 * 
 * Conversational onboarding that builds the wedding kernel.
 * Stores kernel data in tenant for now (simpler, no migration needed).
 */

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface KernelData {
  names?: string[];
  weddingDate?: string;
  planningPhase?: string;
  guestCount?: number;
  budgetTotal?: number;
  vibe?: string[];
  decisions?: Record<string, { name: string; locked: boolean }>;
  stressors?: string[];
  onboardingStep?: number;
}

const ONBOARDING_SYSTEM_PROMPT = `You are Aisle, an AI wedding planner having your first conversation with a new couple. Your goal is to get to know them and understand where they are in their wedding planning journey.

You're warm, calm, and genuinely interested. You ask one question at a time and respond naturally to what they share. Never feel like a form or checklist.

CURRENT ONBOARDING STEP: {step}
WHAT WE KNOW SO FAR: {kernel}

ONBOARDING FLOW:
Step 0: Greet them warmly and ask who's getting married (names)
Step 1: Ask when the wedding is (or if they've set a date yet)
Step 2: Ask roughly how many guests they're thinking
Step 3: Gently ask about budget range (make it comfortable to skip)
Step 4: Ask what vibe or feeling they want for their day
Step 5: Ask what they've already figured out (venue, photographer, etc.)
Step 6: Ask what's on their mind or stressing them out
Step 7: Summarize what you learned and transition to planning mode

STYLE:
- Never use emojis
- Never use emdashes, use commas or periods
- One question at a time
- Acknowledge what they share before asking the next thing
- If they give short answers, that's fine, move on
- If they share a lot, reflect that back briefly
- Keep responses concise, 2-3 sentences usually
- Be warm but not over-the-top

EXTRACTION:
After your response, include a JSON block with any information you learned:
<extract>
{
  "names": ["Name1", "Name2"] or null,
  "weddingDate": "YYYY-MM-DD" or null,
  "planningPhase": "dreaming|early|mid|final|week_of" or null,
  "guestCount": number or null,
  "budgetTotal": number_in_cents or null,
  "vibe": ["keyword", "keyword"] or null,
  "decisions": {"venue": {"name": "...", "locked": true}} or null,
  "stressors": ["thing", "thing"] or null,
  "moveToNextStep": true or false
}
</extract>

Only include fields you actually learned. Set moveToNextStep to true when you've gotten enough info for the current step.`;

function buildKernelContext(kernel: KernelData | null): string {
  if (!kernel) return "Nothing yet, this is the start.";
  
  const parts: string[] = [];
  
  if (kernel.names && kernel.names.length > 0) {
    parts.push(`Names: ${kernel.names.join(" & ")}`);
  }
  if (kernel.weddingDate) {
    parts.push(`Wedding date: ${kernel.weddingDate}`);
  }
  if (kernel.guestCount) {
    parts.push(`Guest count: ~${kernel.guestCount}`);
  }
  if (kernel.budgetTotal) {
    parts.push(`Budget: $${(kernel.budgetTotal / 100).toLocaleString()}`);
  }
  if (kernel.vibe && kernel.vibe.length > 0) {
    parts.push(`Vibe: ${kernel.vibe.join(", ")}`);
  }
  if (kernel.decisions) {
    const booked = Object.entries(kernel.decisions)
      .filter(([, v]) => v?.name)
      .map(([k, v]) => `${k}: ${v.name}`);
    if (booked.length > 0) {
      parts.push(`Already booked: ${booked.join(", ")}`);
    }
  }
  if (kernel.stressors && kernel.stressors.length > 0) {
    parts.push(`Worried about: ${kernel.stressors.join(", ")}`);
  }
  
  return parts.length > 0 ? parts.join("\n") : "Nothing yet, this is the start.";
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, conversationId: inputConversationId } = body;
    const tenantId = session.user.tenantId;

    // Get tenant (we'll store kernel data here for simplicity)
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Get or create conversation
    let conversation = inputConversationId 
      ? await db.query.conciergeConversations.findFirst({
          where: eq(conciergeConversations.id, inputConversationId),
        })
      : null;

    if (!conversation) {
      const [newConversation] = await db.insert(conciergeConversations).values({
        tenantId,
        title: "Getting started",
        messages: [],
      }).returning();
      conversation = newConversation;
    }

    // Parse kernel from conversation or initialize
    // Store kernel in conversation messages metadata for now
    const existingMessages = Array.isArray(conversation.messages) 
      ? conversation.messages as Message[]
      : [];
    
    // Track onboarding step based on conversation length
    const onboardingStep = Math.min(Math.floor(existingMessages.length / 2), 7);

    // Build conversation history for API
    const history: Message[] = [...existingMessages];
    
    // Add user message if provided
    if (message) {
      history.push({ role: "user", content: message });
    }

    // Build system prompt with current context
    const kernelData: KernelData = { onboardingStep };
    const systemPrompt = ONBOARDING_SYSTEM_PROMPT
      .replace("{step}", String(onboardingStep))
      .replace("{kernel}", buildKernelContext(kernelData));

    // If no message and no history, this is first load - generate greeting
    const isFirstLoad = history.length === 0;
    const messagesToSend = isFirstLoad
      ? [{ role: "user" as const, content: "[User just opened the app for the first time. Greet them warmly and ask who's getting married.]" }]
      : history;

    console.log("Sending to Anthropic:", { 
      step: onboardingStep, 
      messageCount: messagesToSend.length,
      isFirstLoad 
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: systemPrompt,
      messages: messagesToSend,
    });

    const assistantMessage = response.content[0].type === "text" 
      ? response.content[0].text 
      : "I'm having trouble responding right now.";

    // Parse extraction and clean message
    const extractMatch = assistantMessage.match(/<extract>([\s\S]*?)<\/extract>/);
    const cleanMessage = assistantMessage.replace(/<extract>[\s\S]*?<\/extract>/, "").trim();
    
    let moveToNextStep = false;
    
    if (extractMatch) {
      try {
        const extracted = JSON.parse(extractMatch[1]);
        moveToNextStep = extracted.moveToNextStep || false;
        
        // Update tenant display name if we got names
        if (extracted.names && extracted.names.length >= 2) {
          await db.update(tenants)
            .set({ 
              displayName: `${extracted.names[0]} & ${extracted.names[1]}`,
              updatedAt: new Date() 
            })
            .where(eq(tenants.id, tenantId));
        }
        
        // Update wedding date if provided
        if (extracted.weddingDate) {
          await db.update(tenants)
            .set({ 
              weddingDate: new Date(extracted.weddingDate),
              updatedAt: new Date() 
            })
            .where(eq(tenants.id, tenantId));
        }
      } catch (e) {
        console.error("Failed to parse extraction:", e);
      }
    }

    // Calculate new step
    const newStep = moveToNextStep ? onboardingStep + 1 : onboardingStep;
    const isOnboardingComplete = newStep >= 7;

    // Update onboarding status if complete
    if (isOnboardingComplete && !tenant.onboardingComplete) {
      await db.update(tenants)
        .set({ onboardingComplete: true, updatedAt: new Date() })
        .where(eq(tenants.id, tenantId));
    }

    // Save conversation with new messages
    const newHistory: Message[] = message 
      ? [...existingMessages, { role: "user", content: message }, { role: "assistant", content: cleanMessage }]
      : [{ role: "assistant", content: cleanMessage }];
    
    await db.update(conciergeConversations)
      .set({ 
        messages: newHistory,
        updatedAt: new Date(),
      })
      .where(eq(conciergeConversations.id, conversation.id));

    return NextResponse.json({ 
      message: cleanMessage,
      conversationId: conversation.id,
      onboardingStep: newStep,
      isOnboardingComplete,
    });
  } catch (error) {
    console.error("Onboarding chat error:", error);
    return NextResponse.json(
      { error: "Failed to get response", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
