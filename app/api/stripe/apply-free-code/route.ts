import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPromoCodeByCode, incrementPromoCodeUses } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !session.user.tenantId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { promoCode } = await request.json();

    if (!promoCode) {
      return NextResponse.json({ success: false, error: "No promo code provided" });
    }

    const code = await getPromoCodeByCode(promoCode.toUpperCase());

    if (!code) {
      return NextResponse.json({ success: false, error: "Invalid promo code" });
    }

    // Validate the code
    if (!code.isActive) {
      return NextResponse.json({ success: false, error: "This promo code is no longer active" });
    }

    if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, error: "This promo code has expired" });
    }

    if (code.maxUses && code.currentUses >= code.maxUses) {
      return NextResponse.json({ success: false, error: "This promo code has reached its usage limit" });
    }

    // Only handle FREE type codes here
    if (code.type !== "free") {
      return NextResponse.json({ 
        success: false, 
        error: "This code is for a discount, not free access. Please continue to checkout." 
      });
    }

    // Grant free access - treat as yearly subscription (best value)
    await db
      .update(tenants)
      .set({
        plan: "yearly",
        subscriptionStatus: "active",
        // Set subscription end far in the future for free codes (effectively lifetime)
        subscriptionEndsAt: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000), // 100 years
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, session.user.tenantId));

    // Increment usage
    await incrementPromoCodeUses(code.id);

    return NextResponse.json({
      success: true,
      message: "Free membership activated! Enjoy unlimited access to Stem.",
    });
  } catch (error) {
    console.error("Apply free code error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to apply promo code" },
      { status: 500 }
    );
  }
}
