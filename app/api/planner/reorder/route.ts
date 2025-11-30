import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getPlannerByTenantId, reorderPages } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { plannerId, pageIds } = await request.json();

    // Verify the planner belongs to this tenant
    const planner = await getPlannerByTenantId(session.user.tenantId);

    if (!planner || planner.id !== plannerId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await reorderPages(plannerId, pageIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder pages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
