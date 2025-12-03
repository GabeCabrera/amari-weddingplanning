import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Anthropic from "@anthropic-ai/sdk";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { tenants, conciergeConversations, weddingKernels } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getAnthropicTools } from "@/lib/ai/tools";
import { executeToolCall, ToolResult } from "@/lib/ai/executor";

/**
 * Aisle Chat API with Tools
 * 
 * The AI can now:
 * - Take actions (add guests, update budget, etc.)
 * - Show artifacts (budget overview, guest list, timeline)
 * - Remember everything about the couple
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
  artifact?: {
    type: string;
    data: unknown;
  };
}

interface WeddingKernel {
  names?: string[];
  location?: string;
  occupations?: string[];
  howTheyMet?: string;
  howLongTogether?: string;
  engagementStory?: string;
  weddingDate?: Date;
  guestCount?: number;
  budgetTotal?: number;
  vibe?: string[];
  formality?: string;
  colorPalette?: string[];
  priorities?: string[];
  stressors?: string[];
  biggestConcern?: string;
  decisions?: Record<string, unknown>;
  vendorsBooked?: string[];
  planningPhase?: string;
}

function buildSystemPrompt(kernel: WeddingKernel | null, today: string): string {
  const kernelContext = buildKernelContext(kernel);
  
  return `You are Aisle, a friendly and capable wedding planner. You're having a conversation with a couple planning their wedding.

TODAY'S DATE: ${today}

WHAT YOU KNOW ABOUT THEM:
${kernelContext}

YOUR CAPABILITIES:
You can DO things, not just talk about them. When the couple mentions something actionable, USE YOUR TOOLS:

- When they mention a cost or vendor → use add_budget_item or add_vendor
- When they mention a guest → use add_guest or add_guest_group  
- When they mention a date/appointment → use add_event
- When they want to see their data → use show_artifact
- When they share wedding details → use update_wedding_details or update_preferences

SHOWING DATA:
When relevant, show them their data using show_artifact. For example:
- After adding budget items, show budget_overview
- After adding guests, show guest_list or guest_stats
- When discussing the timeline, show timeline
- When they ask "how are we doing", show wedding_summary

CONVERSATION STYLE:
- Be warm and natural, like a friend who happens to be great at planning
- Keep responses concise (1-3 sentences usually)
- Use their names once you know them
- NEVER use emojis
- NEVER use emdashes (--). Use commas or periods.
- If you want to laugh, say "Haha" not "Ha,"
- React like a human: "Oh that's great!" "Nice!" "Got it."
- When you take an action, briefly confirm what you did

EXTRACTION:
After your response, include any NEW information you learned:
<extract>
{
  "names": ["Name1", "Name2"] or null,
  "location": "City, State" or null,
  "occupations": ["Job1", "Job2"] or null,
  "howTheyMet": "brief summary" or null,
  "engagementStory": "brief summary" or null,
  "weddingDate": "YYYY-MM-DD" or null,
  "guestCount": number or null,
  "budgetTotal": number_in_cents or null,
  "vibe": ["keyword"] or null,
  "priorities": ["priority"] or null,
  "biggestConcern": "concern" or null
}
</extract>

Only include fields you JUST learned.`;
}

function buildKernelContext(kernel: WeddingKernel | null): string {
  if (!kernel) return "This is a new conversation. You don't know anything about them yet.";
  
  const parts: string[] = [];
  
  if (kernel.names && kernel.names.length > 0) {
    parts.push(`Names: ${kernel.names.join(" & ")}`);
  }
  if (kernel.location) parts.push(`Location: ${kernel.location}`);
  if (kernel.occupations && kernel.occupations.length > 0) {
    parts.push(`Jobs: ${kernel.occupations.join(", ")}`);
  }
  if (kernel.howTheyMet) parts.push(`How they met: ${kernel.howTheyMet}`);
  if (kernel.engagementStory) parts.push(`Engagement: ${kernel.engagementStory}`);
  
  if (kernel.weddingDate) {
    const date = new Date(kernel.weddingDate);
    const daysUntil = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    parts.push(`Wedding: ${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} (${daysUntil} days)`);
  }
  if (kernel.guestCount) parts.push(`Guests: ~${kernel.guestCount}`);
  if (kernel.budgetTotal) parts.push(`Budget: $${(kernel.budgetTotal / 100).toLocaleString()}`);
  if (kernel.vibe && kernel.vibe.length > 0) parts.push(`Vibe: ${kernel.vibe.join(", ")}`);
  if (kernel.vendorsBooked && kernel.vendorsBooked.length > 0) {
    parts.push(`Booked: ${kernel.vendorsBooked.join(", ")}`);
  }
  if (kernel.biggestConcern) parts.push(`Concern: ${kernel.biggestConcern}`);
  
  return parts.length > 0 ? parts.join("\n") : "This is a new conversation.";
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const body = await request.json();
    const { message, conversationId: inputConversationId } = body;

    // Get or create kernel
    let kernel = await db.query.weddingKernels.findFirst({
      where: eq(weddingKernels.tenantId, tenantId),
    });
    
    if (!kernel) {
      const [newKernel] = await db.insert(weddingKernels).values({
        tenantId,
        names: [],
        occupations: [],
        vibe: [],
        priorities: [],
        dealbreakers: [],
        stressors: [],
        decisions: {},
        recentTopics: [],
      }).returning();
      kernel = newKernel;
    }

    // Get or create conversation
    let conversation;
    if (inputConversationId) {
      conversation = await db.query.conciergeConversations.findFirst({
        where: and(
          eq(conciergeConversations.id, inputConversationId),
          eq(conciergeConversations.tenantId, tenantId)
        ),
      });
    }
    if (!conversation) {
      const [newConv] = await db.insert(conciergeConversations).values({
        tenantId,
        title: "Chat",
        messages: [],
      }).returning();
      conversation = newConv;
    }

    // Build message history
    const existingMessages: Message[] = Array.isArray(conversation.messages)
      ? (conversation.messages as Message[]).filter(m => m?.role && m?.content)
      : [];
    
    const history = existingMessages.map(m => ({ role: m.role, content: m.content }));
    if (message) {
      history.push({ role: "user" as const, content: message });
    }

    // Build prompt
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    const systemPrompt = buildSystemPrompt(kernel as WeddingKernel, today);

    // Handle first message
    const isFirstLoad = history.length === 0;
    const messagesToSend = isFirstLoad
      ? [{ role: "user" as const, content: "[User just opened the app. Say hi casually.]" }]
      : history;

    // Call Anthropic
    const anthropic = getAnthropicClient();
    let response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      system: systemPrompt,
      tools: getAnthropicTools(),
      messages: messagesToSend,
    });

    // Process tool calls
    const toolResults: ToolResult[] = [];
    let artifact: { type: string; data: unknown } | undefined;

    while (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
      );

      const toolResultContents: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        const result = await executeToolCall(
          toolUse.name,
          toolUse.input as Record<string, unknown>,
          { tenantId }
        );
        toolResults.push(result);

        if (toolUse.name === "show_artifact" && result.artifact) {
          artifact = result.artifact;
        }

        toolResultContents.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        });
      }

      response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1024,
        system: systemPrompt,
        tools: getAnthropicTools(),
        messages: [
          ...messagesToSend,
          { role: "assistant", content: response.content },
          { role: "user", content: toolResultContents },
        ],
      });
    }

    // Extract text
    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === "text"
    );
    const finalText = textBlock?.text || "I'm having trouble responding.";

    // Clean extraction tags
    const extractMatch = finalText.match(/<extract>([\s\S]*?)<\/extract>/);
    const cleanMessage = finalText.replace(/<extract>[\s\S]*?<\/extract>/, "").trim();

    // Update kernel from extraction
    if (extractMatch) {
      try {
        const extracted = JSON.parse(extractMatch[1]);
        await updateKernelFromExtraction(kernel.id, tenantId, extracted);
      } catch (e) {
        console.error("Extraction parse error:", e);
      }
    }

    // Save messages
    const newMessages: Message[] = message
      ? [...existingMessages, { role: "user", content: message }, { role: "assistant", content: cleanMessage, artifact }]
      : [...existingMessages, { role: "assistant", content: cleanMessage, artifact }];

    await db.update(conciergeConversations)
      .set({ messages: newMessages, updatedAt: new Date() })
      .where(eq(conciergeConversations.id, conversation.id));

    return NextResponse.json({ 
      message: cleanMessage,
      conversationId: conversation.id,
      artifact,
      toolResults: toolResults.length > 0 ? toolResults : undefined,
    });

  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to get response", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

async function updateKernelFromExtraction(
  kernelId: string,
  tenantId: string,
  extracted: Record<string, unknown>
): Promise<void> {
  const kernel = await db.query.weddingKernels.findFirst({
    where: eq(weddingKernels.id, kernelId)
  });
  if (!kernel) return;

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (extracted.names && Array.isArray(extracted.names)) {
    const current = (kernel.names as string[]) || [];
    updates.names = [...new Set([...current, ...extracted.names])];
    const names = updates.names as string[];
    if (names.length >= 2) {
      await db.update(tenants)
        .set({ displayName: `${names[0]} & ${names[1]}` })
        .where(eq(tenants.id, tenantId));
    }
  }

  if (extracted.location) updates.location = extracted.location;
  if (extracted.howTheyMet) updates.howTheyMet = extracted.howTheyMet;
  if (extracted.engagementStory) updates.engagementStory = extracted.engagementStory;
  if (extracted.biggestConcern) updates.biggestConcern = extracted.biggestConcern;

  if (extracted.weddingDate) {
    const date = new Date(extracted.weddingDate as string);
    if (!isNaN(date.getTime())) {
      updates.weddingDate = date;
      await db.update(tenants).set({ weddingDate: date }).where(eq(tenants.id, tenantId));
    }
  }

  if (extracted.guestCount) updates.guestCount = extracted.guestCount;
  if (extracted.budgetTotal) updates.budgetTotal = extracted.budgetTotal;

  // Merge arrays
  const arrayFields = ['occupations', 'vibe', 'priorities'] as const;
  for (const field of arrayFields) {
    if (extracted[field] && Array.isArray(extracted[field])) {
      const current = (kernel[field] as string[]) || [];
      updates[field] = [...new Set([...current, ...(extracted[field] as string[])])];
    }
  }

  if (Object.keys(updates).length > 1) {
    await db.update(weddingKernels).set(updates).where(eq(weddingKernels.id, kernelId));
  }
}
