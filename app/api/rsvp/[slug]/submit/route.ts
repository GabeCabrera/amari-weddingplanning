import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rsvpForms, rsvpResponses, pages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { 
  rsvpSubmissionSchema, 
  validateRequest, 
  checkRateLimit,
  sanitizeString 
} from "@/lib/validation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Sanitize slug
    const sanitizedSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 100);

    // Rate limit by IP (10 submissions per minute per IP)
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";
    const rateLimitKey = `rsvp:${ip}`;
    const { allowed, remaining } = checkRateLimit(rateLimitKey, 10, 60000);
    
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429,
          headers: { "Retry-After": "60" }
        }
      );
    }

    // Parse and validate body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate input with Zod schema
    const validation = validateRequest(rsvpSubmissionSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    // Get the RSVP form
    const [form] = await db
      .select()
      .from(rsvpForms)
      .where(eq(rsvpForms.slug, sanitizedSlug))
      .limit(1);

    if (!form || !form.isActive) {
      return NextResponse.json(
        { error: "RSVP form not found or inactive" },
        { status: 404 }
      );
    }

    // Validate meal choice against allowed options if provided
    if (validatedData.mealChoice && form.mealOptions) {
      const allowedMeals = form.mealOptions as string[];
      if (allowedMeals.length > 0 && !allowedMeals.includes(validatedData.mealChoice)) {
        return NextResponse.json(
          { error: "Invalid meal choice" },
          { status: 400 }
        );
      }
    }

    // Insert the response with sanitized data
    const [response] = await db
      .insert(rsvpResponses)
      .values({
        formId: form.id,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address,
        attending: validatedData.attending ?? null,
        mealChoice: validatedData.mealChoice,
        dietaryRestrictions: validatedData.dietaryRestrictions,
        plusOne: validatedData.plusOne,
        plusOneName: validatedData.plusOneName,
        plusOneMeal: validatedData.plusOneMeal,
        songRequest: validatedData.songRequest,
        notes: validatedData.notes,
        syncedToGuestList: false,
      })
      .returning();

    // Auto-sync to guest list page
    await syncResponseToGuestList(form.pageId, response);

    return NextResponse.json(
      { success: true },
      { 
        headers: { 
          "X-RateLimit-Remaining": remaining.toString() 
        }
      }
    );
  } catch (error) {
    console.error("RSVP submit error:", error);
    return NextResponse.json(
      { error: "Failed to submit RSVP" },
      { status: 500 }
    );
  }
}

async function syncResponseToGuestList(
  pageId: string, 
  response: typeof rsvpResponses.$inferSelect
) {
  try {
    // Get the guest list page
    const [page] = await db
      .select()
      .from(pages)
      .where(eq(pages.id, pageId))
      .limit(1);

    if (!page) return;

    const fields = page.fields as Record<string, unknown>;
    const guests = (fields.guests as Record<string, unknown>[]) || [];

    // Add the new guest (data is already sanitized from validation)
    const newGuest: Record<string, unknown> = {
      name: response.name,
      email: response.email || "",
      phone: response.phone || "",
      address: response.address || "",
      rsvp: response.attending ?? false,
      meal: response.mealChoice || "",
      dietaryRestrictions: response.dietaryRestrictions || "",
      plusOne: response.plusOne || false,
      plusOneName: response.plusOneName || "",
      notes: response.notes || "",
      giftReceived: false,
      thankYouSent: false,
    };

    guests.push(newGuest);

    // If they have a plus one, add that too
    if (response.plusOne && response.plusOneName) {
      const plusOneGuest: Record<string, unknown> = {
        name: response.plusOneName,
        email: "",
        phone: "",
        address: "",
        rsvp: response.attending ?? false,
        meal: response.plusOneMeal || "",
        dietaryRestrictions: "",
        plusOne: false,
        plusOneName: "",
        notes: sanitizeString(`Guest of ${response.name}`),
        giftReceived: false,
        thankYouSent: false,
      };
      guests.push(plusOneGuest);
    }

    // Update the page
    await db
      .update(pages)
      .set({
        fields: { ...fields, guests },
        updatedAt: new Date(),
      })
      .where(eq(pages.id, pageId));

    // Mark response as synced
    await db
      .update(rsvpResponses)
      .set({ syncedToGuestList: true })
      .where(eq(rsvpResponses.id, response.id));

  } catch (error) {
    console.error("Failed to sync to guest list:", error);
  }
}
