import { z } from "zod";

// ============================================================================
// SANITIZATION HELPERS
// ============================================================================

/**
 * Sanitize a string to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return "";
  
  return input
    .toString()
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, "")
    // Remove script-like patterns
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    // Limit length to prevent DoS
    .slice(0, 10000);
}

/**
 * Sanitize an email address
 */
export function sanitizeEmail(input: string | null | undefined): string {
  if (!input) return "";
  
  const sanitized = input.toString().trim().toLowerCase().slice(0, 254);
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) ? sanitized : "";
}

/**
 * Sanitize a phone number - keep only digits and common separators
 */
export function sanitizePhone(input: string | null | undefined): string {
  if (!input) return "";
  
  return input
    .toString()
    .replace(/[^0-9+\-() ]/g, "")
    .slice(0, 20);
}

/**
 * Sanitize for safe database storage and display
 */
export function sanitizeForDb(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "boolean" || typeof value === "number") {
      sanitized[key] = value;
    } else if (value === null || value === undefined) {
      sanitized[key] = null;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === "object" && item !== null 
          ? sanitizeForDb(item as Record<string, unknown>)
          : typeof item === "string" 
            ? sanitizeString(item)
            : item
      );
    } else if (typeof value === "object") {
      sanitized[key] = sanitizeForDb(value as Record<string, unknown>);
    }
  }
  
  return sanitized;
}

// ============================================================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================================================

// Registration
export const registerSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name is too long")
    .transform(sanitizeString),
  email: z.string()
    .email("Invalid email address")
    .max(254, "Email is too long")
    .transform(s => s.toLowerCase().trim()),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

// Login
export const loginSchema = z.object({
  email: z.string()
    .email("Invalid email address")
    .transform(s => s.toLowerCase().trim()),
  password: z.string().min(1, "Password is required"),
});

// RSVP submission (public form)
export const rsvpSubmissionSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(200, "Name is too long")
    .transform(sanitizeString),
  email: z.string()
    .max(254)
    .optional()
    .transform(val => val ? sanitizeEmail(val) : null),
  phone: z.string()
    .max(20)
    .optional()
    .transform(val => val ? sanitizePhone(val) : null),
  address: z.string()
    .max(500, "Address is too long")
    .optional()
    .transform(val => val ? sanitizeString(val) : null),
  attending: z.boolean().nullable().optional(),
  mealChoice: z.string()
    .max(100)
    .optional()
    .transform(val => val ? sanitizeString(val) : null),
  dietaryRestrictions: z.string()
    .max(500)
    .optional()
    .transform(val => val ? sanitizeString(val) : null),
  plusOne: z.boolean().optional().default(false),
  plusOneName: z.string()
    .max(200)
    .optional()
    .transform(val => val ? sanitizeString(val) : null),
  plusOneMeal: z.string()
    .max(100)
    .optional()
    .transform(val => val ? sanitizeString(val) : null),
  songRequest: z.string()
    .max(200)
    .optional()
    .transform(val => val ? sanitizeString(val) : null),
  notes: z.string()
    .max(1000, "Notes are too long")
    .optional()
    .transform(val => val ? sanitizeString(val) : null),
});

// Page update
export const pageUpdateSchema = z.object({
  pageId: z.string().uuid("Invalid page ID"),
  fields: z.record(z.unknown()).transform(sanitizeForDb),
});

// RSVP form creation/update
export const rsvpFormSchema = z.object({
  pageId: z.string().uuid("Invalid page ID"),
  title: z.string()
    .max(100)
    .optional()
    .transform(val => val ? sanitizeString(val) : "RSVP"),
  message: z.string()
    .max(500)
    .optional()
    .transform(val => val ? sanitizeString(val) : null),
  fields: z.record(z.boolean()).optional(),
  mealOptions: z.array(z.string().max(100).transform(sanitizeString))
    .max(20, "Too many meal options")
    .optional(),
});

// Template IDs for adding pages
export const addPagesSchema = z.object({
  templateIds: z.array(
    z.string()
      .max(50)
      .regex(/^[a-z0-9-]+$/, "Invalid template ID")
  ).min(1, "At least one template is required")
    .max(20, "Too many templates"),
});

// Page deletion
export const deletePageSchema = z.object({
  pageId: z.string().uuid("Invalid page ID"),
});

// Reorder pages
export const reorderPagesSchema = z.object({
  pageIds: z.array(z.string().uuid()).min(1).max(100),
});

// ============================================================================
// RATE LIMITING HELPER (simple in-memory, use Redis in production)
// ============================================================================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);

// ============================================================================
// VALIDATION HELPER
// ============================================================================

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const firstError = result.error.errors[0];
    return { 
      success: false, 
      error: firstError?.message || "Validation failed" 
    };
  }
  
  return { success: true, data: result.data };
}
