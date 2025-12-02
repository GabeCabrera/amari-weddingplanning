import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Anthropic from "@anthropic-ai/sdk";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { tenants, conciergeConversations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Onboarding Chat API
 * π-ID: 3.14159.7
 */

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }
  return new Anthropic({ apiKey });
}

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

const ONBOARDING_SYSTEM_PROMPT = `You are Aisle, a wedding planner. You're having a first conversation with someone who just found your service. Talk to them like you're meeting a new friend at a coffee shop, not like you're running them through a checklist.

Your goal is to get to know them as people first. The wedding planning stuff will come naturally.

TODAY'S DATE: {today}

WHAT YOU KNOW SO FAR:
{kernel}

CONVERSATION FLOW (let this unfold naturally, don't rush):

1. FIRST, get to know them as people:
   - Start casual. "Hi, how are you? I'm Aisle."
   - Ask their name. When they tell you, ask about their partner.
   - Ask where they're based, what they do, what they're into.
   - Be curious about them as humans, not just as "engaged couple."

2. THEN, get curious about their story:
   - "So how did you two meet?" (genuinely interested)
   - React to their story. Ask follow ups if it's interesting.
   - "And how did the proposal happen?" or "Who popped the question?"
   - Let them share. Don't rush past the good stuff.

3. ONLY THEN, ease into wedding planning:
   - "So have you two set a date yet, or still figuring that out?"
   - "Any idea how big you're thinking? Intimate or big party?"
   - "Have you started looking at venues or anything yet?"
   - "What's the vibe you're going for?"

4. FINALLY, wrap up and offer to help:
   - "What's feeling most overwhelming right now?"
   - "I'd love to help you figure this out. Where should we start?"

STYLE RULES (these are strict):
- NEVER use emojis. Ever.
- NEVER use emdashes (--). Use commas or periods instead.
- NEVER say "Ha," - if you want to laugh, say "Haha" instead.
- One question at a time. Let them answer.
- Short responses. 1-3 sentences usually. This is a conversation, not a speech.
- Use their names once you know them.
- React like a human. "Oh that's so sweet." "Haha, I love that." "Oh wow."
- If they give short answers, that's fine. Don't push.
- If they share something meaningful, acknowledge it before moving on.
- Sound like a real person, not a customer service bot.
- Contractions are good. "I'm" not "I am." "You're" not "you are."
- Be warm but not saccharine. No "I'm SO excited for you!!!"

EXTRACTION:
After your response, include a JSON block with any information you learned:
<extract>
{
  "names": ["Name1", "Name2"] or null,
  "location": "City, State" or null,
  "howTheyMet": "brief summary" or null,
  "engagementStory": "brief summary" or null,
  "weddingDate": "YYYY-MM-DD" or null,
  "guestCount": number or null,
  "vibe": ["keyword", "keyword"] or null,
  "venueStatus": "none|looking|booked" or null,
  "biggestConcern": "what's stressing them" or null,
  "moveToNextStep": true or false
}
</extract>

Only include fields you actually learned in this message. Don't make things up.`;

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
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.tenantId) {
      console.log("Onboarding: No session or tenantId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    console.log("Onboarding: tenantId =", tenantId);

    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error("Onboarding: Failed to parse request body:", e);
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    
    const { message, conversationId: inputConversationId } = body;
    console.log("Onboarding: message =", message?.substring(0, 50), "conversationId =", inputConversationId);

    // Get tenant
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });

    if (!tenant) {
      console.log("Onboarding: Tenant not found");
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Get or create conversation
    let conversation;
    
    if (inputConversationId) {
      // Try to find existing conversation that belongs to this tenant
      conversation = await db.query.conciergeConversations.findFirst({
        where: and(
          eq(conciergeConversations.id, inputConversationId),
          eq(conciergeConversations.tenantId, tenantId)
        ),
      });
      console.log("Onboarding: Found existing conversation:", !!conversation);
    }

    if (!conversation) {
      // Create new conversation
      console.log("Onboarding: Creating new conversation");
      const [newConversation] = await db.insert(conciergeConversations).values({
        tenantId,
        title: "Getting started",
        messages: [],
      }).returning();
      conversation = newConversation;
      console.log("Onboarding: Created conversation:", conversation.id);
    }

    // Get existing messages and validate them
    let existingMessages: Message[] = [];
    if (Array.isArray(conversation.messages)) {
      // Filter to only valid messages with proper role and content
      existingMessages = (conversation.messages as Message[]).filter(
        (m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
      );
    }
    
    console.log("Onboarding: Existing messages count:", existingMessages.length);
    
    // Track onboarding step based on conversation length
    const onboardingStep = Math.min(Math.floor(existingMessages.length / 2), 7);

    // Build conversation history for API
    const history: Message[] = [...existingMessages];
    
    // Add user message if provided
    if (message) {
      history.push({ role: "user", content: message });
    }

    // Build system prompt with current date
    const kernelData: KernelData = { onboardingStep };
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const systemPrompt = ONBOARDING_SYSTEM_PROMPT
      .replace("{today}", today)
      .replace("{step}", String(onboardingStep))
      .replace("{kernel}", buildKernelContext(kernelData));

    // If no message and no history, generate greeting
    const isFirstLoad = history.length === 0;
    const messagesToSend = isFirstLoad
      ? [{ role: "user" as const, content: "[User just opened the app. Say hi casually and ask how they're doing. Keep it simple and warm, like meeting someone new.]" }]
      : history;

    console.log("Onboarding: Calling Anthropic with", messagesToSend.length, "messages");
    console.log("Onboarding: Messages to send:", JSON.stringify(messagesToSend));

    let response;
    try {
      const anthropic = getAnthropicClient();
      response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 500,
        system: systemPrompt,
        messages: messagesToSend,
      });
    } catch (apiError) {
      console.error("Onboarding: Anthropic API error:", apiError);
      throw apiError;
    }

    console.log("Onboarding: Anthropic responded in", Date.now() - startTime, "ms");

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
        console.error("Onboarding: Failed to parse extraction:", e);
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
      : [...existingMessages, { role: "assistant", content: cleanMessage }];
    
    await db.update(conciergeConversations)
      .set({ 
        messages: newHistory,
        updatedAt: new Date(),
      })
      .where(eq(conciergeConversations.id, conversation.id));

    console.log("Onboarding: Saved conversation, total messages:", newHistory.length);

    return NextResponse.json({ 
      message: cleanMessage,
      conversationId: conversation.id,
      onboardingStep: newStep,
      isOnboardingComplete,
    });
  } catch (error) {
    console.error("Onboarding chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", { message: errorMessage, stack: errorStack });
    
    return NextResponse.json(
      { error: "Failed to get response", details: errorMessage },
      { status: 500 }
    );
  }
}
