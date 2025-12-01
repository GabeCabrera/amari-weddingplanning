import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getGoogleCalendarConnection } from "@/lib/db/queries";
import { syncCalendar } from "@/lib/calendar/sync-engine";

// POST /api/calendar/google/sync - Trigger calendar sync
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

    const result = await syncCalendar(session.user.tenantId);

    return NextResponse.json({
      success: result.success,
      pushed: result.pushed,
      pulled: result.pulled,
      deleted: result.deleted,
      errors: result.errors,
    });
  } catch (error) {
    console.error("Calendar sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync calendar" },
      { status: 500 }
    );
  }
}
