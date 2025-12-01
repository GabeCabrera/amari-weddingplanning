import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getAuthUrl } from "@/lib/calendar/google-client";

// GET /api/calendar/google/connect - Initiate OAuth flow
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create state with tenant ID for verification in callback
    const state = Buffer.from(
      JSON.stringify({
        tenantId: session.user.tenantId,
        userId: session.user.id,
        timestamp: Date.now(),
      })
    ).toString("base64");

    const authUrl = getAuthUrl(state);

    // Redirect to Google OAuth
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Google connect error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Google connection" },
      { status: 500 }
    );
  }
}
