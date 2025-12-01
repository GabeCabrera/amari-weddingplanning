import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  getCalendarEventsByTenantId,
  createCalendarEvent,
} from "@/lib/db/queries";
import { z } from "zod";

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  category: z.enum(["vendor", "deadline", "appointment", "milestone", "personal", "other"]).default("other"),
  color: z.string().optional(),
  vendorId: z.string().optional(),
  taskId: z.string().optional(),
});

// GET /api/calendar/events - List all events for the tenant
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await getCalendarEventsByTenantId(session.user.tenantId);

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Get calendar events error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/calendar/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const result = createEventSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = result.data;

    const event = await createCalendarEvent({
      tenantId: session.user.tenantId,
      title: data.title,
      description: data.description,
      startTime: new Date(data.startTime),
      endTime: data.endTime ? new Date(data.endTime) : null,
      allDay: data.allDay,
      location: data.location,
      category: data.category,
      color: data.color || null,
      vendorId: data.vendorId,
      taskId: data.taskId,
      syncStatus: "local",
      createdBy: session.user.id,
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Create calendar event error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
