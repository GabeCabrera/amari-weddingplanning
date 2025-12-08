import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { syncTasksToCalendar } from "@/lib/calendar/internal-sync";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type } = await request.json().catch(() => ({ type: "all" }));

    if (type === "tasks" || type === "all") {
      const result = await syncTasksToCalendar(session.user.tenantId);
      return NextResponse.json({ 
        success: true, 
        message: `Synced ${result.tasksSynced} tasks`,
        details: result
      });
    }

    return NextResponse.json({ success: true, message: "Nothing to sync" });

  } catch (error) {
    console.error("Internal sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
