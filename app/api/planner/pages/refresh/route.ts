import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { pages, planners } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/planner/pages/refresh?pageId=xxx
 * 
 * Fetches the latest data for a specific page.
 * Used for syncing after AI makes changes.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");

    // Get planner for this tenant
    const planner = await db.query.planners.findFirst({
      where: eq(planners.tenantId, session.user.tenantId)
    });

    if (!planner) {
      return NextResponse.json({ error: "Planner not found" }, { status: 404 });
    }

    // If specific page requested, return just that page
    if (pageId) {
      const page = await db.query.pages.findFirst({
        where: and(
          eq(pages.id, pageId),
          eq(pages.plannerId, planner.id)
        )
      });

      if (!page) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
      }

      return NextResponse.json({ page });
    }

    // Otherwise return all pages
    const allPages = await db.query.pages.findMany({
      where: eq(pages.plannerId, planner.id),
      orderBy: (pages, { asc }) => [asc(pages.position)]
    });

    return NextResponse.json({ pages: allPages });
  } catch (error) {
    console.error("Error refreshing pages:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
