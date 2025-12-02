import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Anthropic from "@anthropic-ai/sdk";
import { authOptions } from "@/lib/auth/config";

/**
 * Authenticated Chat API
 * π-ID: 3.14159.5.3
 */

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPT = `You are Aisle, an AI wedding planner. You help couples plan their wedding with warmth and expertise.

You have access to the couple's wedding data and can help them with:
- Budget planning and tracking
- Guest list management
- Vendor selection and coordination
- Timeline and task management
- Seating arrangements
- Day-of scheduling
- General wedding advice and emotional support

STYLE GUIDELINES:
- Never use emojis
- Never use emdashes. Use commas or periods instead.
- Keep a grounded, unhurried tone
- Be warm but practical
- Keep responses concise unless the topic needs depth
- When someone is stressed, acknowledge their feelings before offering solutions

ARTIFACT GUIDELINES:
When you need to show structured data (guest list, budget breakdown, timeline, etc.), you can include an artifact in your response. Format it as:

<artifact type="budget|guests|vendors|timeline|checklist|schedule" title="Title Here">
{JSON data here}
</artifact>

Only use artifacts when showing actual data, not for general explanations.`;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // TODO: Load wedding kernel and conversation history
    // TODO: Load relevant wedding data based on message content

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: message }],
    });

    const assistantMessage = response.content[0].type === "text" 
      ? response.content[0].text 
      : "I'm having trouble responding right now.";

    // Parse out any artifacts from the response
    const artifactMatch = assistantMessage.match(/<artifact type="(\w+)" title="([^"]+)">([\s\S]*?)<\/artifact>/);
    
    let cleanMessage = assistantMessage;
    let artifact = null;

    if (artifactMatch) {
      cleanMessage = assistantMessage.replace(artifactMatch[0], "").trim();
      try {
        artifact = {
          type: artifactMatch[1],
          title: artifactMatch[2],
          data: JSON.parse(artifactMatch[3]),
        };
      } catch {
        // If JSON parsing fails, just include as raw text
        artifact = {
          type: artifactMatch[1],
          title: artifactMatch[2],
          data: artifactMatch[3],
        };
      }
    }

    // TODO: Update wedding kernel based on conversation
    // TODO: Save message to conversation history

    return NextResponse.json({ 
      message: cleanMessage,
      artifact,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}
