import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // Find user by unsubscribe token
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.unsubscribeToken, token))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    // Update user to unsubscribe
    await db
      .update(users)
      .set({
        emailOptIn: false,
        unsubscribedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
