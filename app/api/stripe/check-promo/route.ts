import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getPromoCodeByCode } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { promoCode } = await request.json();

    if (!promoCode) {
      return NextResponse.json({ valid: false, error: "No promo code provided" });
    }

    const code = await getPromoCodeByCode(promoCode.toUpperCase());

    if (!code) {
      return NextResponse.json({ valid: false, error: "Invalid promo code" });
    }

    // Check if active
    if (!code.isActive) {
      return NextResponse.json({ valid: false, error: "This promo code is no longer active" });
    }

    // Check expiration
    if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: "This promo code has expired" });
    }

    // Check max uses
    if (code.maxUses && code.currentUses >= code.maxUses) {
      return NextResponse.json({ valid: false, error: "This promo code has reached its usage limit" });
    }

    // Return code details
    let description = "";
    if (code.type === "percentage") {
      description = `${code.value}% off`;
    } else if (code.type === "fixed") {
      description = `$${(code.value / 100).toFixed(2)} off`;
    } else if (code.type === "free") {
      description = "Free membership";
    }

    return NextResponse.json({
      valid: true,
      type: code.type,
      value: code.value,
      description,
    });
  } catch (error) {
    console.error("Check promo error:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to check promo code" },
      { status: 500 }
    );
  }
}
