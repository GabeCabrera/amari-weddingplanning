import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  getPasswordResetToken,
  deletePasswordResetToken,
  updateUserPassword,
} from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const resetToken = await getPasswordResetToken(token);

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 400 }
      );
    }

    if (new Date() > resetToken.expiresAt) {
      await deletePasswordResetToken(token);
      return NextResponse.json(
        { error: "Reset link has expired" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await updateUserPassword(resetToken.userId, passwordHash);
    await deletePasswordResetToken(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
