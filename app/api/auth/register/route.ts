import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { tenants, users } from "@/lib/db/schema";
import { getUserByEmail, scheduleEmail } from "@/lib/db/queries";
import { nanoid } from "nanoid";
import { registerSchema, checkRateLimit, sanitizeString } from "@/lib/validation";
import { sendEmail, getScheduledTime } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP (5 registrations per hour per IP)
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";
    const rateLimitKey = `register:${ip}`;
    const { allowed } = checkRateLimit(rateLimitKey, 5, 3600000);
    
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": "3600" } }
      );
    }

    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    // Sanitize
    const name = sanitizeString(result.data.name);
    const email = result.data.email.toLowerCase().trim();
    const password = result.data.password;

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Generate a unique slug for the tenant
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 30);
    const slug = `${baseSlug}-${nanoid(6)}`;

    // Hash password with strong cost factor
    const passwordHash = await bcrypt.hash(password, 12);

    // Use proper UUIDs for database IDs
    const tenantId = randomUUID();
    const userId = randomUUID();

    // Create tenant first
    await db.insert(tenants).values({
      id: tenantId,
      slug,
      displayName: name,
      plan: "free",
      onboardingComplete: false,
    });

    // Create user
    await db.insert(users).values({
      id: userId,
      tenantId,
      email,
      name,
      passwordHash,
      role: "owner",
      mustChangePassword: false,
    });

    // =========================================================================
    // EMAIL SEQUENCE
    // =========================================================================
    
    // Send welcome email immediately (fire and forget - don't block registration)
    sendEmail({
      to: email,
      template: "welcome",
      data: { name },
    }).catch((err) => console.error("Failed to send welcome email:", err));

    // Schedule follow-up emails
    try {
      // "Why we charge $29" email - 1 hour later
      await scheduleEmail(
        userId,
        tenantId,
        "why_29",
        getScheduledTime("why_29")
      );

      // "Tips for your first week" email - 3 days later
      await scheduleEmail(
        userId,
        tenantId,
        "tips_week_1",
        getScheduledTime("tips_week_1")
      );
    } catch (err) {
      // Don't fail registration if email scheduling fails
      console.error("Failed to schedule emails:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
