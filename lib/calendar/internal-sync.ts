import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { 
  calendarEvents, 
  pages, 
  planners, 
  type NewCalendarEvent 
} from "@/lib/db/schema";
import { createCalendarEvent, updateCalendarEvent } from "@/lib/db/queries";

export interface SyncResult {
  tasksSynced: number;
  errors: string[];
}

export async function syncTasksToCalendar(tenantId: string): Promise<SyncResult> {
  const result: SyncResult = {
    tasksSynced: 0,
    errors: []
  };

  try {
    // 1. Get the Task Board page
    const planner = await db.query.planners.findFirst({
      where: eq(planners.tenantId, tenantId)
    });

    if (!planner) {
      throw new Error("Planner not found");
    }

    const taskPage = await db.query.pages.findFirst({
      where: and(
        eq(pages.plannerId, planner.id),
        eq(pages.templateId, "task-board")
      )
    });

    if (!taskPage || !taskPage.fields || !Array.isArray((taskPage.fields as any).tasks)) {
      return result; // No tasks to sync
    }

    const tasks = (taskPage.fields as any).tasks as Array<{
      id: string;
      title: string;
      dueDate?: string;
      status?: string;
      description?: string;
    }>;

    // 2. Iterate tasks and sync
    for (const task of tasks) {
      if (!task.dueDate) continue;

      // Check if event already exists for this task
      const existingEvent = await db.query.calendarEvents.findFirst({
        where: and(
          eq(calendarEvents.tenantId, tenantId),
          eq(calendarEvents.taskId, task.id)
        )
      });

      const eventData = {
        title: task.title,
        description: task.description,
        startTime: new Date(task.dueDate), // Assuming due date is "YYYY-MM-DD" or ISO
        allDay: true, // Tasks are usually due on a day, not a specific time
        category: "deadline",
        color: "#EF4444", // Red for deadlines
        taskId: task.id,
      };

      if (existingEvent) {
        // Update if changed
        const existingDate = new Date(existingEvent.startTime).toISOString().split('T')[0];
        const newDate = new Date(task.dueDate).toISOString().split('T')[0];

        if (
          existingEvent.title !== task.title || 
          existingDate !== newDate ||
          existingEvent.description !== (task.description || null)
        ) {
          await updateCalendarEvent(existingEvent.id, tenantId, eventData);
          result.tasksSynced++;
        }
      } else {
        // Create new
        await createCalendarEvent({
          tenantId,
          ...eventData,
          syncStatus: "local"
        } as NewCalendarEvent);
        result.tasksSynced++;
      }
    }

  } catch (error) {
    console.error("Sync tasks error:", error);
    result.errors.push(error instanceof Error ? error.message : "Unknown error");
  }

  return result;
}
