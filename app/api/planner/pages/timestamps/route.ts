import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { pages, planners } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/planner/pages/timestamps
 * 
 * Returns the latest updatedAt timestamps for all pages.
 * Used for polling-based sync to detect changes.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get planner for this tenant
    const planner = await db.query.planners.findFirst({
      where: eq(planners.tenantId, session.user.tenantId)
    });

    if (!planner) {
      return NextResponse.json({});
    }

    // Get all pages with their timestamps
    const allPages = await db.query.pages.findMany({
      where: eq(pages.plannerId, planner.id),
      columns: {
        id: true,
        templateId: true,
        updatedAt: true
      }
    });

    // Build a map of pageId -> updatedAt
    const timestamps: Record<string, string> = {};
    for (const page of allPages) {
      timestamps[page.id] = page.updatedAt?.toISOString() || "";
    }

    return NextResponse.json(timestamps);
  } catch (error) {
    console.error("Error fetching page timestamps:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
