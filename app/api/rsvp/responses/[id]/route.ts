import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { rsvpResponses, rsvpForms } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Mark a response as synced to guest list
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the response
    const response = await db.query.rsvpResponses.findFirst({
      where: eq(rsvpResponses.id, id),
      with: {
        form: true,
      },
    });

    if (!response) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    // Verify the form belongs to this tenant
    const form = await db.query.rsvpForms.findFirst({
      where: and(
        eq(rsvpForms.id, response.formId),
        eq(rsvpForms.tenantId, session.user.tenantId)
      ),
    });

    if (!form) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the response
    await db
      .update(rsvpResponses)
      .set({ syncedToGuestList: true })
      .where(eq(rsvpResponses.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error syncing RSVP response:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
