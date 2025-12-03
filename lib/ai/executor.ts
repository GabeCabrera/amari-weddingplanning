/**
 * Aisle AI Tool Executor
 * 
 * Executes tool calls from the AI and returns results.
 * Each tool function takes parameters and a context (tenantId, etc.)
 */

import { db } from "@/lib/db";
import { 
  weddingKernels, 
  pages, 
  planners,
  calendarEvents,
  tenants 
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// ============================================================================
// TYPES
// ============================================================================

export interface ToolContext {
  tenantId: string;
  userId?: string;
}

export interface ToolResult {
  success: boolean;
  message: string;
  data?: unknown;
  artifact?: {
    type: string;
    data: unknown;
  };
}

// ============================================================================
// MAIN EXECUTOR
// ============================================================================

export async function executeToolCall(
  toolName: string,
  parameters: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  console.log(`Executing tool: ${toolName}`, parameters);

  try {
    switch (toolName) {
      // Budget tools
      case "add_budget_item":
        return await addBudgetItem(parameters, context);
      case "update_budget_item":
        return await updateBudgetItem(parameters, context);
      case "set_total_budget":
        return await setTotalBudget(parameters, context);

      // Guest tools
      case "add_guest":
        return await addGuest(parameters, context);
      case "update_guest":
        return await updateGuest(parameters, context);
      case "add_guest_group":
        return await addGuestGroup(parameters, context);

      // Calendar tools
      case "add_event":
        return await addEvent(parameters, context);
      case "add_day_of_event":
        return await addDayOfEvent(parameters, context);

      // Vendor tools
      case "add_vendor":
        return await addVendor(parameters, context);
      case "update_vendor_status":
        return await updateVendorStatus(parameters, context);

      // Task tools
      case "add_task":
        return await addTask(parameters, context);
      case "complete_task":
        return await completeTask(parameters, context);

      // Artifact tools
      case "show_artifact":
        return await showArtifact(parameters, context);

      // Kernel tools
      case "update_wedding_details":
        return await updateWeddingDetails(parameters, context);
      case "update_preferences":
        return await updatePreferences(parameters, context);

      default:
        return {
          success: false,
          message: `Unknown tool: ${toolName}`
        };
    }
  } catch (error) {
    console.error(`Tool execution error (${toolName}):`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Tool execution failed"
    };
  }
}

// ============================================================================
// HELPER: Get or create planner and page
// ============================================================================

async function getOrCreatePage(
  tenantId: string, 
  templateId: string
): Promise<{ plannerId: string; pageId: string; fields: Record<string, unknown> }> {
  // Get or create planner
  let planner = await db.query.planners.findFirst({
    where: eq(planners.tenantId, tenantId)
  });

  if (!planner) {
    const [newPlanner] = await db.insert(planners).values({
      tenantId
    }).returning();
    planner = newPlanner;
  }

  // Get or create page for this template
  let page = await db.query.pages.findFirst({
    where: and(
      eq(pages.plannerId, planner.id),
      eq(pages.templateId, templateId)
    )
  });

  if (!page) {
    const [newPage] = await db.insert(pages).values({
      plannerId: planner.id,
      templateId,
      title: getTemplateTitle(templateId),
      fields: getDefaultFields(templateId)
    }).returning();
    page = newPage;
  }

  return {
    plannerId: planner.id,
    pageId: page.id,
    fields: (page.fields as Record<string, unknown>) || {}
  };
}

function getTemplateTitle(templateId: string): string {
  const titles: Record<string, string> = {
    "budget": "Budget",
    "guest-list": "Guest List",
    "vendor-contacts": "Vendors",
    "day-of-schedule": "Day-Of Timeline",
    "task-board": "Tasks",
    "calendar": "Calendar"
  };
  return titles[templateId] || templateId;
}

function getDefaultFields(templateId: string): Record<string, unknown> {
  const defaults: Record<string, Record<string, unknown>> = {
    "budget": { totalBudget: 0, items: [] },
    "guest-list": { guests: [] },
    "vendor-contacts": { vendors: [] },
    "day-of-schedule": { events: [] },
    "task-board": { tasks: [] }
  };
  return defaults[templateId] || {};
}

// ============================================================================
// BUDGET TOOLS
// ============================================================================

async function addBudgetItem(
  params: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  const { pageId, fields } = await getOrCreatePage(context.tenantId, "budget");
  
  const items = (fields.items as Array<Record<string, unknown>>) || [];
  
  const newItem = {
    id: crypto.randomUUID(),
    category: params.category,
    vendor: params.vendor || "",
    totalCost: (params.estimatedCost as number) * 100, // Convert to cents
    amountPaid: ((params.amountPaid as number) || 0) * 100,
    notes: params.notes || "",
    createdAt: new Date().toISOString()
  };

  items.push(newItem);

  await db.update(pages)
    .set({ fields: { ...fields, items }, updatedAt: new Date() })
    .where(eq(pages.id, pageId));

  // Also update kernel decisions
  await updateKernelDecision(context.tenantId, params.category as string, {
    status: "budgeted",
    amount: params.estimatedCost
  });

  return {
    success: true,
    message: `Added ${params.category} to budget: $${params.estimatedCost}`,
    data: newItem
  };
}

async function updateBudgetItem(
  params: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  const { pageId, fields } = await getOrCreatePage(context.tenantId, "budget");
  
  const items = (fields.items as Array<Record<string, unknown>>) || [];
  const itemIndex = items.findIndex(i => i.id === params.itemId);

  if (itemIndex === -1) {
    return { success: false, message: "Budget item not found" };
  }

  if (params.estimatedCost !== undefined) {
    items[itemIndex].totalCost = (params.estimatedCost as number) * 100;
  }
  if (params.amountPaid !== undefined) {
    items[itemIndex].amountPaid = (params.amountPaid as number) * 100;
  }
  if (params.vendor !== undefined) {
    items[itemIndex].vendor = params.vendor;
  }
  if (params.notes !== undefined) {
    items[itemIndex].notes = params.notes;
  }

  await db.update(pages)
    .set({ fields: { ...fields, items }, updatedAt: new Date() })
    .where(eq(pages.id, pageId));

  return {
    success: true,
    message: "Budget item updated",
    data: items[itemIndex]
  };
}

async function setTotalBudget(
  params: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  const { pageId, fields } = await getOrCreatePage(context.tenantId, "budget");
  const amount = (params.amount as number) * 100; // Convert to cents

  await db.update(pages)
    .set({ fields: { ...fields, totalBudget: amount }, updatedAt: new Date() })
    .where(eq(pages.id, pageId));

  // Also update kernel
  await db.update(weddingKernels)
    .set({ budgetTotal: amount, updatedAt: new Date() })
    .where(eq(weddingKernels.tenantId, context.tenantId));

  return {
    success: true,
    message: `Total budget set to $${params.amount}`,
    data: { totalBudget: amount }
  };
}

// ============================================================================
// GUEST TOOLS
// ============================================================================

async function addGuest(
  params: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  const { pageId, fields } = await getOrCreatePage(context.tenantId, "guest-list");
  
  const guests = (fields.guests as Array<Record<string, unknown>>) || [];
  
  const newGuest = {
    id: crypto.randomUUID(),
    name: params.name,
    email: params.email || "",
    phone: params.phone || "",
    address: params.address || "",
    side: params.side || "both",
    group: params.group || "",
    plusOne: params.plusOne || false,
    rsvp: "pending",
    createdAt: new Date().toISOString()
  };

  guests.push(newGuest);

  await db.update(pages)
    .set({ fields: { ...fields, guests }, updatedAt: new Date() })
    .where(eq(pages.id, pageId));

  // Update kernel guest count
  await db.update(weddingKernels)
    .set({ guestCount: guests.length, updatedAt: new Date() })
    .where(eq(weddingKernels.tenantId, context.tenantId));

  return {
    success: true,
    message: `Added ${params.name} to guest list`,
    data: newGuest
  };
}

async function updateGuest(
  params: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  const { pageId, fields } = await getOrCreatePage(context.tenantId, "guest-list");
  
  const guests = (fields.guests as Array<Record<string, unknown>>) || [];
  const guestIndex = guests.findIndex(g => g.id === params.guestId);

  if (guestIndex === -1) {
    return { success: false, message: "Guest not found" };
  }

  // Update fields that were provided
  Object.keys(params).forEach(key => {
    if (key !== "guestId" && params[key] !== undefined) {
      guests[guestIndex][key] = params[key];
    }
  });

  await db.update(pages)
    .set({ fields: { ...fields, guests }, updatedAt: new Date() })
    .where(eq(pages.id, pageId));

  return {
    success: true,
    message: `Updated guest: ${guests[guestIndex].name}`,
    data: guests[guestIndex]
  };
}

async function addGuestGroup(
  params: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  const { pageId, fields } = await getOrCreatePage(context.tenantId, "guest-list");
  
  const guests = (fields.guests as Array<Record<string, unknown>>) || [];
  const guestNames = params.guests as string[];
  const newGuests: Array<Record<string, unknown>> = [];

  for (const name of guestNames) {
    const newGuest = {
      id: crypto.randomUUID(),
      name,
      side: params.side || "both",
      group: params.group || "",
      rsvp: "pending",
      createdAt: new Date().toISOString()
    };
    guests.push(newGuest);
    newGuests.push(newGuest);
  }

  await db.update(pages)
    .set({ fields: { ...fields, guests }, updatedAt: new Date() })
    .where(eq(pages.id, pageId));

  // Update kernel guest count
  await db.update(weddingKernels)
    .set({ guestCount: guests.length, updatedAt: new Date() })
    .where(eq(weddingKernels.tenantId, context.tenantId));

  return {
    success: true,
    message: `Added ${guestNames.length} guests to the list`,
    data: newGuests
  };
}

// ============================================================================
// CALENDAR TOOLS
// ============================================================================

async function addEvent(
  params: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  const startTime = new Date(`${params.date}T${params.time || "12:00"}`);
  
  const [event] = await db.insert(calendarEvents).values({
    tenantId: context.tenantId,
    title: params.title as string,
    startTime,
    endTime: params.endTime ? new Date(`${params.date}T${params.endTime}`) : undefined,
    location: params.location as string,
    category: (params.category as string) || "other",
    description: params.notes as string
  }).returning();

  return {
    success: true,
    message: `Added "${params.title}" to calendar on ${params.date}`,
    data: event
  };
}

async function addDayOfEvent(
  params: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  const { pageId, fields } = await getOrCreatePage(context.tenantId, "day-of-schedule");
  
  const events = (fields.events as Array<Record<string, unknown>>) || [];
  
  const newEvent = {
    id: crypto.randomUUID(),
    time: params.time,
    event: params.event,
    duration: params.duration,
    location: params.location || "",
    notes: params.notes || ""
  };

  events.push(newEvent);
  
  // Sort by time
  events.sort((a, b) => {
    const timeA = String(a.time).replace(/[^0-9:]/g, "");
    const timeB = String(b.time).replace(/[^0-9:]/g, "");
    return timeA.localeCompare(timeB);
  });

  await db.update(pages)
    .set({ fields: { ...fields, events }, updatedAt: new Date() })
    .where(eq(pages.id, pageId));

  return {
    success: true,
    message: `Added "${params.event}" at ${params.time} to day-of timeline`,
    data: newEvent
  };
}

// ============================================================================
// VENDOR TOOLS
// ============================================================================

async function addVendor(
  params: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  const { pageId, fields } = await getOrCreatePage(context.tenantId, "vendor-contacts");
  
  const vendors = (fields.vendors as Array<Record<string, unknown>>) || [];
  
  const newVendor = {
    id: crypto.randomUUID(),
    category: params.category,
    name: params.name,
    contactName: params.contactName || "",
    email: params.email || "",
    phone: params.phone || "",
    status: params.status || "researching",
    price: params.price ? (params.price as number) * 100 : null,
    notes: params.notes || "",
    depositPaid: false,
    contractSigned: false,
    createdAt: new Date().toISOString()
  };

  vendors.push(newVendor);

  await db.update(pages)
    .set({ fields: { ...fields, vendors }, updatedAt: new Date() })
    .where(eq(pages.id, pageId));

  // Update kernel decisions
  await updateKernelDecision(context.tenantId, params.category as string, {
    status: params.status,
    name: params.name,
    locked: params.status === "booked"
  });

  return {
    success: true,
    message: `Added ${params.name} (${params.category}) to vendors`,
    data: newVendor
  };
}

async function updateVendorStatus(
  params: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  const { pageId, fields } = await getOrCreatePage(context.tenantId, "vendor-contacts");
  
  const vendors = (fields.vendors as Array<Record<string, unknown>>) || [];
  const vendorIndex = vendors.findIndex(v => v.id === params.vendorId);

  if (vendorIndex === -1) {
    return { success: false, message: "Vendor not found" };
  }

  vendors[vendorIndex].status = params.status;
  if (params.depositPaid !== undefined) {
    vendors[vendorIndex].depositPaid = params.depositPaid;
  }
  if (params.contractSigned !== undefined) {
    vendors[vendorIndex].contractSigned = params.contractSigned;
  }

  await db.update(pages)
    .set({ fields: { ...fields, vendors }, updatedAt: new Date() })
    .where(eq(pages.id, pageId));

  // Update kernel
  const vendor = vendors[vendorIndex];
  await updateKernelDecision(context.tenantId, vendor.category as string, {
    status: params.status,
    name: vendor.name,
    locked: params.status === "booked"
  });

  return {
    success: true,
    message: `Updated ${vendor.name} status to ${params.status}`,
    data: vendors[vendorIndex]
  };
}

// ============================================================================
// TASK TOOLS
// ============================================================================

async function addTask(
  params: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  const { pageId, fields } = await getOrCreatePage(context.tenantId, "task-board");
  
  const tasks = (fields.tasks as Array<Record<string, unknown>>) || [];
  
  const newTask = {
    id: crypto.randomUUID(),
    title: params.title,
    dueDate: params.dueDate,
    assignee: params.assignee || "both",
    priority: params.priority || "medium",
    category: params.category || "",
    status: "todo",
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);

  await db.update(pages)
    .set({ fields: { ...fields, tasks }, updatedAt: new Date() })
    .where(eq(pages.id, pageId));

  return {
    success: true,
    message: `Added task: "${params.title}"`,
    data: newTask
  };
}

async function completeTask(
  params: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  const { pageId, fields } = await getOrCreatePage(context.tenantId, "task-board");
  
  const tasks = (fields.tasks as Array<Record<string, unknown>>) || [];
  const taskIndex = tasks.findIndex(t => t.id === params.taskId);

  if (taskIndex === -1) {
    return { success: false, message: "Task not found" };
  }

  tasks[taskIndex].status = "done";
  tasks[taskIndex].completedAt = new Date().toISOString();

  await db.update(pages)
    .set({ fields: { ...fields, tasks }, updatedAt: new Date() })
    .where(eq(pages.id, pageId));

  return {
    success: true,
    message: `Completed task: "${tasks[taskIndex].title}"`,
    data: tasks[taskIndex]
  };
}

// ============================================================================
// ARTIFACT TOOLS
// ============================================================================

async function showArtifact(
  params: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  const artifactType = params.type as string;
  
  // Fetch relevant data based on artifact type
  let data: unknown;

  switch (artifactType) {
    case "budget_overview":
    case "budget_category": {
      const { fields } = await getOrCreatePage(context.tenantId, "budget");
      data = {
        totalBudget: fields.totalBudget || 0,
        items: fields.items || [],
        filter: params.filter
      };
      break;
    }

    case "guest_list":
    case "guest_stats": {
      const { fields } = await getOrCreatePage(context.tenantId, "guest-list");
      const guests = (fields.guests as Array<Record<string, unknown>>) || [];
      data = {
        guests,
        stats: {
          total: guests.length,
          confirmed: guests.filter(g => g.rsvp === "yes").length,
          declined: guests.filter(g => g.rsvp === "no").length,
          pending: guests.filter(g => g.rsvp === "pending").length
        }
      };
      break;
    }

    case "timeline": {
      const { fields } = await getOrCreatePage(context.tenantId, "day-of-schedule");
      data = { events: fields.events || [] };
      break;
    }

    case "calendar": {
      const events = await db.query.calendarEvents.findMany({
        where: eq(calendarEvents.tenantId, context.tenantId),
        orderBy: (events, { asc }) => [asc(events.startTime)]
      });
      data = { events };
      break;
    }

    case "vendor_list":
    case "vendor_comparison": {
      const { fields } = await getOrCreatePage(context.tenantId, "vendor-contacts");
      data = {
        vendors: fields.vendors || [],
        filter: params.filter
      };
      break;
    }

    case "checklist": {
      const { fields } = await getOrCreatePage(context.tenantId, "task-board");
      data = { tasks: fields.tasks || [] };
      break;
    }

    case "countdown": {
      const kernel = await db.query.weddingKernels.findFirst({
        where: eq(weddingKernels.tenantId, context.tenantId)
      });
      const weddingDate = kernel?.weddingDate;
      const daysUntil = weddingDate 
        ? Math.ceil((weddingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;
      data = { weddingDate, daysUntil };
      break;
    }

    case "wedding_summary": {
      const kernel = await db.query.weddingKernels.findFirst({
        where: eq(weddingKernels.tenantId, context.tenantId)
      });
      const { fields: budgetFields } = await getOrCreatePage(context.tenantId, "budget");
      const { fields: guestFields } = await getOrCreatePage(context.tenantId, "guest-list");
      
      data = {
        kernel,
        budget: {
          total: budgetFields.totalBudget || 0,
          items: budgetFields.items || []
        },
        guests: guestFields.guests || []
      };
      break;
    }

    default:
      return {
        success: false,
        message: `Unknown artifact type: ${artifactType}`
      };
  }

  return {
    success: true,
    message: `Showing ${artifactType}`,
    artifact: {
      type: artifactType,
      data
    }
  };
}

// ============================================================================
// KERNEL TOOLS
// ============================================================================

async function updateWeddingDetails(
  params: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (params.weddingDate) {
    updates.weddingDate = new Date(params.weddingDate as string);
    // Also update tenant
    await db.update(tenants)
      .set({ weddingDate: updates.weddingDate as Date })
      .where(eq(tenants.id, context.tenantId));
  }
  if (params.ceremonyTime) updates.ceremonyTime = params.ceremonyTime;
  if (params.receptionTime) updates.receptionTime = params.receptionTime;
  if (params.guestCount) updates.guestCount = params.guestCount;

  // Update venue in decisions
  if (params.venueName || params.venueAddress) {
    const kernel = await db.query.weddingKernels.findFirst({
      where: eq(weddingKernels.tenantId, context.tenantId)
    });
    const decisions = (kernel?.decisions as Record<string, unknown>) || {};
    decisions.venue = {
      ...(decisions.venue as Record<string, unknown> || {}),
      name: params.venueName || (decisions.venue as Record<string, unknown>)?.name,
      address: params.venueAddress,
      locked: true
    };
    updates.decisions = decisions;
  }

  await db.update(weddingKernels)
    .set(updates)
    .where(eq(weddingKernels.tenantId, context.tenantId));

  return {
    success: true,
    message: "Wedding details updated",
    data: updates
  };
}

async function updatePreferences(
  params: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  const kernel = await db.query.weddingKernels.findFirst({
    where: eq(weddingKernels.tenantId, context.tenantId)
  });

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (params.vibe) {
    const currentVibe = (kernel?.vibe as string[]) || [];
    updates.vibe = [...new Set([...currentVibe, ...(params.vibe as string[])])];
  }
  if (params.colorPalette) {
    const current = (kernel?.colorPalette as string[]) || [];
    updates.colorPalette = [...new Set([...current, ...(params.colorPalette as string[])])];
  }
  if (params.mustHaves) {
    const current = (kernel?.mustHaves as string[]) || [];
    updates.mustHaves = [...new Set([...current, ...(params.mustHaves as string[])])];
  }
  if (params.dealbreakers) {
    const current = (kernel?.dealbreakers as string[]) || [];
    updates.dealbreakers = [...new Set([...current, ...(params.dealbreakers as string[])])];
  }

  await db.update(weddingKernels)
    .set(updates)
    .where(eq(weddingKernels.tenantId, context.tenantId));

  return {
    success: true,
    message: "Preferences updated",
    data: updates
  };
}

// ============================================================================
// HELPER: Update kernel decisions
// ============================================================================

async function updateKernelDecision(
  tenantId: string,
  category: string,
  update: Record<string, unknown>
): Promise<void> {
  const kernel = await db.query.weddingKernels.findFirst({
    where: eq(weddingKernels.tenantId, tenantId)
  });

  const decisions = (kernel?.decisions as Record<string, unknown>) || {};
  decisions[category] = {
    ...(decisions[category] as Record<string, unknown> || {}),
    ...update
  };

  // Update vendorsBooked array if status is booked
  let vendorsBooked = (kernel?.vendorsBooked as string[]) || [];
  if (update.locked || update.status === "booked") {
    if (!vendorsBooked.includes(category)) {
      vendorsBooked = [...vendorsBooked, category];
    }
  }

  await db.update(weddingKernels)
    .set({ 
      decisions, 
      vendorsBooked,
      updatedAt: new Date() 
    })
    .where(eq(weddingKernels.tenantId, tenantId));
}
