import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  exchangeCodeForTokens,
  createWeddingCalendar,
  getCalendarShareLink,
} from "@/lib/calendar/google-client";
import {
  createGoogleCalendarConnection,
  getGoogleCalendarConnection,
  getTenantById,
} from "@/lib/db/queries";
import { google } from "googleapis";

// GET /api/calendar/google/callback - Handle OAuth callback
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(
        new URL("/planner?error=google_auth_failed", request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/planner?error=missing_code", request.url)
      );
    }

    // Decode and verify state
    let stateData: { tenantId: string; userId: string; timestamp: number };
    try {
      stateData = JSON.parse(Buffer.from(state, "base64").toString());
    } catch {
      return NextResponse.redirect(
        new URL("/planner?error=invalid_state", request.url)
      );
    }

    // Verify session matches state
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId || session.user.tenantId !== stateData.tenantId) {
      return NextResponse.redirect(
        new URL("/planner?error=session_mismatch", request.url)
      );
    }

    // Check if already connected
    const existingConnection = await getGoogleCalendarConnection(stateData.tenantId);
    if (existingConnection) {
      return NextResponse.redirect(
        new URL("/planner?message=already_connected", request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Get tenant info for calendar name
    const tenant = await getTenantById(stateData.tenantId);
    const calendarName = tenant?.displayName
      ? `${tenant.displayName}'s Wedding`
      : "Wedding Planning";

    // Create dedicated wedding calendar in Google
    const { calendarId, shareLink } = await createWeddingCalendar(
      stateData.tenantId,
      calendarName
    );

    // Get user email using oauth2 API temporarily
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: tokens.accessToken,
    });
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    // Save connection to database
    await createGoogleCalendarConnection({
      tenantId: stateData.tenantId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiresAt: tokens.expiresAt,
      weddingCalendarId: calendarId,
      weddingCalendarName: calendarName,
      googleEmail: userInfo.email || null,
      connectedBy: stateData.userId,
    });

    // Redirect back to planner with success message
    return NextResponse.redirect(
      new URL("/planner?message=google_connected", request.url)
    );
  } catch (error) {
    console.error("Google callback error:", error);
    return NextResponse.redirect(
      new URL("/planner?error=connection_failed", request.url)
    );
  }
}
