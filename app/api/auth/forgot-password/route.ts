import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createPasswordResetToken } from "@/lib/db/queries";
import { generateResetToken } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await createPasswordResetToken(user.id, token, expiresAt);

    // TODO: Send email with reset link
    // In production, integrate with an email service like Resend, SendGrid, etc.
    // The reset link should be: https://{subdomain}.stem.wedding/reset-password?token={token}
    console.log(`Password reset token for ${email}: ${token}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
