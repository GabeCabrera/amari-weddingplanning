import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users, tenants } from "@/lib/db/schema";
import { eq, desc, like, or, count, and } from "drizzle-orm";
import { getUserByEmail } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = ["gabecabr@gmail.com"];

async function isAdmin(session: { user?: { email?: string | null } } | null): Promise<boolean> {
  if (!session?.user?.email) return false;
  if (ADMIN_EMAILS.includes(session.user.email)) return true;
  const user = await getUserByEmail(session.user.email);
  return user?.isAdmin ?? false;
}

// GET /api/manage-x7k9/users - Get all users with pagination and search
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!(await isAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const planFilter = searchParams.get("plan") || "";

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          like(users.email, `%${search}%`),
          like(users.name, `%${search}%`),
          like(tenants.displayName, `%${search}%`)
        )
      );
    }
    
    if (planFilter === "free" || planFilter === "complete") {
      conditions.push(eq(tenants.plan, planFilter));
    }

    // Get total count
    const [totalResult] = await db.select({ count: count() }).from(users);
    const total = totalResult?.count || 0;

    // Get paginated results
    const results = await db
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
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

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
