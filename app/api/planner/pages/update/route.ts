import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getPlannerByTenantId, getPageById, updatePageFields } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { pageId, fields } = await request.json();

    // Verify the page belongs to this tenant's planner
    const planner = await getPlannerByTenantId(session.user.tenantId);

    if (!planner) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const page = await getPageById(pageId, planner.id);

    if (!page) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    await updatePageFields(pageId, fields);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update page fields error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
