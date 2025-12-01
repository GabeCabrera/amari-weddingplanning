import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getGoogleCalendarConnection } from "@/lib/db/queries";
import { getCalendarShareLink } from "@/lib/calendar/google-client";

// GET /api/calendar/google/status - Get Google Calendar connection status
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connection = await getGoogleCalendarConnection(session.user.tenantId);

    if (!connection) {
      return NextResponse.json({
        connected: false,
      });
    }

    // Generate share link for partner
    const shareLink = getCalendarShareLink(connection.weddingCalendarId);

    return NextResponse.json({
      connected: true,
      email: connection.googleEmail,
      calendarName: connection.weddingCalendarName,
      lastSyncAt: connection.lastSyncAt?.toISOString() || null,
      shareLink,
      syncEnabled: connection.syncEnabled,
    });
  } catch (error) {
    console.error("Get Google status error:", error);
    return NextResponse.json(
      { error: "Failed to get Google Calendar status" },
      { status: 500 }
    );
  }
}
