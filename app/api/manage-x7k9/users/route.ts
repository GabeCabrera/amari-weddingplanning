import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users, tenants } from "@/lib/db/schema";
import { eq, desc, like, or, count } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/manage-x7k9/users - Get all users with pagination and search
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const plan = searchParams.get("plan") || "";

    const offset = (page - 1) * limit;

    // Build base query
    let query = db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        emailOptIn: users.emailOptIn,
        unsubscribedAt: users.unsubscribedAt,
        createdAt: users.createdAt,
        tenant: {
          id: tenants.id,
          displayName: tenants.displayName,
          slug: tenants.slug,
          plan: tenants.plan,
          weddingDate: tenants.weddingDate,
          onboardingComplete: tenants.onboardingComplete,
        },
      })
      .from(users)
      .innerJoin(tenants, eq(users.tenantId, tenants.id))
      .orderBy(desc(users.createdAt));

    // Apply search filter
    if (search) {
      query = query.where(
        or(
          like(users.email, `%${search}%`),
          like(users.name, `%${search}%`),
          like(tenants.displayName, `%${search}%`)
        )
      ) as typeof query;
    }

    // Apply plan filter
    if (plan && (plan === "free" || plan === "complete")) {
      query = query.where(eq(tenants.plan, plan)) as typeof query;
    }

    // Get total count
    const [totalResult] = await db.select({ count: count() }).from(users);
    const total = totalResult?.count || 0;

    // Get paginated results
    const results = await query.limit(limit).offset(offset);

    return NextResponse.json({
      users: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Failed to get users" },
      { status: 500 }
    );
  }
}
