import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  getGoogleCalendarConnection,
  deleteGoogleCalendarConnection,
} from "@/lib/db/queries";
import { deleteWeddingCalendar } from "@/lib/calendar/google-client";

// POST /api/calendar/google/disconnect - Disconnect Google Calendar
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connection = await getGoogleCalendarConnection(session.user.tenantId);

    if (!connection) {
      return NextResponse.json(
        { error: "No Google Calendar connection found" },
        { status: 404 }
      );
    }

    // Try to delete the calendar from Google (optional - might fail if already deleted)
    try {
      await deleteWeddingCalendar(session.user.tenantId, connection.weddingCalendarId);
    } catch (error) {
      console.error("Failed to delete Google calendar:", error);
      // Continue anyway - we still want to remove the connection
    }

    // Delete the connection from our database
    await deleteGoogleCalendarConnection(session.user.tenantId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Google disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Google Calendar" },
      { status: 500 }
    );
  }
}
