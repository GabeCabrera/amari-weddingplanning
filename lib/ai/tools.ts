/**
 * Aisle AI Tool Definitions
 * 
 * These tools allow the AI to take actions, not just chat.
 * Each tool has a name, description, and parameter schema.
 */

export interface ToolParameter {
  type: "string" | "number" | "boolean" | "array" | "object";
  description: string;
  required?: boolean;
  enum?: string[];
  items?: ToolParameter;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, ToolParameter>;
    required: string[];
  };
}

// ============================================================================
// TOOL DEFINITIONS
// ============================================================================

export const tools: ToolDefinition[] = [
  // ----------------------------------------
  // BUDGET TOOLS
  // ----------------------------------------
  {
    name: "add_budget_item",
    description: "Add a new item to the wedding budget. Use this when the user mentions a cost, vendor, or expense they're planning.",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "The budget category",
          enum: [
            "venue",
            "catering",
            "photography",
            "videography",
            "florist",
            "music_dj",
            "attire",
            "hair_makeup",
            "invitations",
            "cake",
            "decorations",
            "transportation",
            "officiant",
            "rings",
            "favors",
            "honeymoon",
            "other"
          ]
        },
        vendor: {
          type: "string",
          description: "Name of the vendor or description of the expense"
        },
        estimatedCost: {
          type: "number",
          description: "Estimated total cost in dollars"
        },
        amountPaid: {
          type: "number",
          description: "Amount already paid in dollars (default 0)"
        },
        notes: {
          type: "string",
          description: "Any additional notes"
        }
      },
      required: ["category", "estimatedCost"]
    }
  },
  {
    name: "update_budget_item",
    description: "Update an existing budget item with new information.",
    parameters: {
      type: "object",
      properties: {
        itemId: {
          type: "string",
          description: "The ID of the budget item to update"
        },
        estimatedCost: {
          type: "number",
          description: "New estimated cost in dollars"
        },
        amountPaid: {
          type: "number",
          description: "New amount paid in dollars"
        },
        vendor: {
          type: "string",
          description: "Updated vendor name"
        },
        notes: {
          type: "string",
          description: "Updated notes"
        }
      },
      required: ["itemId"]
    }
  },
  {
    name: "set_total_budget",
    description: "Set or update the total wedding budget.",
    parameters: {
      type: "object",
      properties: {
        amount: {
          type: "number",
          description: "Total budget in dollars"
        }
      },
      required: ["amount"]
    }
  },

  // ----------------------------------------
  // GUEST LIST TOOLS
  // ----------------------------------------
  {
    name: "add_guest",
    description: "Add a guest to the wedding guest list.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Guest's full name"
        },
        email: {
          type: "string",
          description: "Guest's email address"
        },
        phone: {
          type: "string",
          description: "Guest's phone number"
        },
        side: {
          type: "string",
          description: "Which partner invited them",
          enum: ["partner1", "partner2", "both"]
        },
        group: {
          type: "string",
          description: "Guest grouping (family, friends, work, etc.)"
        },
        plusOne: {
          type: "boolean",
          description: "Whether they get a plus one"
        },
        address: {
          type: "string",
          description: "Mailing address for invitations"
        }
      },
      required: ["name"]
    }
  },
  {
    name: "update_guest",
    description: "Update a guest's information or RSVP status.",
    parameters: {
      type: "object",
      properties: {
        guestId: {
          type: "string",
          description: "The ID of the guest to update"
        },
        rsvp: {
          type: "string",
          description: "RSVP status",
          enum: ["pending", "yes", "no", "maybe"]
        },
        mealChoice: {
          type: "string",
          description: "Their meal selection"
        },
        dietaryRestrictions: {
          type: "string",
          description: "Any dietary restrictions"
        },
        tableNumber: {
          type: "number",
          description: "Assigned table number"
        }
      },
      required: ["guestId"]
    }
  },
  {
    name: "add_guest_group",
    description: "Add multiple guests at once (like a family).",
    parameters: {
      type: "object",
      properties: {
        guests: {
          type: "array",
          description: "Array of guest names to add",
          items: { type: "string", description: "Guest name" }
        },
        side: {
          type: "string",
          description: "Which partner invited them",
          enum: ["partner1", "partner2", "both"]
        },
        group: {
          type: "string",
          description: "Group name (e.g., 'Smith Family')"
        }
      },
      required: ["guests"]
    }
  },

  // ----------------------------------------
  // CALENDAR / TIMELINE TOOLS
  // ----------------------------------------
  {
    name: "add_event",
    description: "Add an event to the wedding calendar (appointments, deadlines, tasks).",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Event title"
        },
        date: {
          type: "string",
          description: "Event date (YYYY-MM-DD format)"
        },
        time: {
          type: "string",
          description: "Event time (HH:MM format, optional)"
        },
        endTime: {
          type: "string",
          description: "End time if applicable"
        },
        location: {
          type: "string",
          description: "Location of the event"
        },
        category: {
          type: "string",
          description: "Type of event",
          enum: ["vendor_meeting", "deadline", "appointment", "tasting", "fitting", "other"]
        },
        notes: {
          type: "string",
          description: "Additional notes"
        }
      },
      required: ["title", "date"]
    }
  },
  {
    name: "add_day_of_event",
    description: "Add an event to the wedding day timeline.",
    parameters: {
      type: "object",
      properties: {
        time: {
          type: "string",
          description: "Time of the event (e.g., '4:00 PM')"
        },
        event: {
          type: "string",
          description: "What happens at this time"
        },
        duration: {
          type: "number",
          description: "Duration in minutes"
        },
        location: {
          type: "string",
          description: "Where this happens"
        },
        notes: {
          type: "string",
          description: "Additional details"
        }
      },
      required: ["time", "event"]
    }
  },

  // ----------------------------------------
  // VENDOR TOOLS
  // ----------------------------------------
  {
    name: "add_vendor",
    description: "Add a vendor to track (booked or considering).",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Type of vendor",
          enum: [
            "venue",
            "photographer",
            "videographer",
            "caterer",
            "florist",
            "dj",
            "band",
            "officiant",
            "planner",
            "hair",
            "makeup",
            "cake",
            "rentals",
            "transportation",
            "other"
          ]
        },
        name: {
          type: "string",
          description: "Vendor/company name"
        },
        contactName: {
          type: "string",
          description: "Contact person's name"
        },
        email: {
          type: "string",
          description: "Email address"
        },
        phone: {
          type: "string",
          description: "Phone number"
        },
        status: {
          type: "string",
          description: "Current status",
          enum: ["researching", "contacted", "meeting_scheduled", "booked", "passed"]
        },
        price: {
          type: "number",
          description: "Quoted price in dollars"
        },
        notes: {
          type: "string",
          description: "Notes about this vendor"
        }
      },
      required: ["category", "name"]
    }
  },
  {
    name: "update_vendor_status",
    description: "Update the status of a vendor (e.g., mark as booked).",
    parameters: {
      type: "object",
      properties: {
        vendorId: {
          type: "string",
          description: "The ID of the vendor to update"
        },
        status: {
          type: "string",
          description: "New status",
          enum: ["researching", "contacted", "meeting_scheduled", "booked", "passed"]
        },
        depositPaid: {
          type: "boolean",
          description: "Whether deposit has been paid"
        },
        contractSigned: {
          type: "boolean",
          description: "Whether contract has been signed"
        }
      },
      required: ["vendorId", "status"]
    }
  },

  // ----------------------------------------
  // TASK TOOLS
  // ----------------------------------------
  {
    name: "add_task",
    description: "Add a task to the wedding to-do list.",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Task description"
        },
        dueDate: {
          type: "string",
          description: "When it's due (YYYY-MM-DD)"
        },
        assignee: {
          type: "string",
          description: "Who's responsible",
          enum: ["partner1", "partner2", "both", "other"]
        },
        priority: {
          type: "string",
          description: "Priority level",
          enum: ["low", "medium", "high"]
        },
        category: {
          type: "string",
          description: "Task category"
        }
      },
      required: ["title"]
    }
  },
  {
    name: "complete_task",
    description: "Mark a task as complete.",
    parameters: {
      type: "object",
      properties: {
        taskId: {
          type: "string",
          description: "The ID of the task to complete"
        }
      },
      required: ["taskId"]
    }
  },

  // ----------------------------------------
  // ARTIFACT / DISPLAY TOOLS
  // ----------------------------------------
  {
    name: "show_artifact",
    description: "Display data visually as an interactive artifact. Use this to show the user their data in a visual format.",
    parameters: {
      type: "object",
      properties: {
        type: {
          type: "string",
          description: "Type of artifact to display",
          enum: [
            "budget_overview",      // Full budget breakdown
            "budget_category",      // Single category detail
            "guest_list",           // Full guest list table
            "guest_stats",          // RSVP stats summary
            "timeline",             // Day-of timeline
            "calendar",             // Upcoming events
            "vendor_list",          // All vendors
            "vendor_comparison",    // Compare vendors side by side
            "checklist",            // Task checklist
            "countdown",            // Days until wedding
            "seating_chart",        // Table assignments
            "wedding_summary"       // Overview of everything
          ]
        },
        filter: {
          type: "string",
          description: "Optional filter (e.g., category name, date range)"
        }
      },
      required: ["type"]
    }
  },

  // ----------------------------------------
  // KERNEL / PROFILE TOOLS
  // ----------------------------------------
  {
    name: "update_wedding_details",
    description: "Update core wedding details like date, venue, guest count, etc.",
    parameters: {
      type: "object",
      properties: {
        weddingDate: {
          type: "string",
          description: "Wedding date (YYYY-MM-DD)"
        },
        ceremonyTime: {
          type: "string",
          description: "Ceremony start time"
        },
        receptionTime: {
          type: "string",
          description: "Reception start time"
        },
        guestCount: {
          type: "number",
          description: "Expected guest count"
        },
        venueName: {
          type: "string",
          description: "Venue name"
        },
        venueAddress: {
          type: "string",
          description: "Venue address"
        }
      },
      required: []
    }
  },
  {
    name: "update_preferences",
    description: "Update the couple's preferences and style.",
    parameters: {
      type: "object",
      properties: {
        vibe: {
          type: "array",
          description: "Style keywords",
          items: { type: "string", description: "Vibe keyword" }
        },
        colorPalette: {
          type: "array",
          description: "Color palette",
          items: { type: "string", description: "Color" }
        },
        mustHaves: {
          type: "array",
          description: "Things they definitely want",
          items: { type: "string", description: "Must have" }
        },
        dealbreakers: {
          type: "array",
          description: "Things they definitely don't want",
          items: { type: "string", description: "Dealbreaker" }
        }
      },
      required: []
    }
  }
];

// ============================================================================
// HELPER: Convert to Anthropic tool format
// ============================================================================

export function getAnthropicTools() {
  return tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.parameters
  }));
}

// ============================================================================
// HELPER: Get tool by name
// ============================================================================

export function getToolByName(name: string): ToolDefinition | undefined {
  return tools.find(t => t.name === name);
}
