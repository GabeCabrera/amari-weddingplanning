import { getTemplateById, type TemplateField } from "./registry";
import type { Page } from "@/lib/db/schema";

export interface ValidationResult {
  isComplete: boolean;
  totalFields: number;
  completedFields: number;
  missingFields: string[];
}

function isFieldFilled(value: unknown, field: TemplateField): boolean {
  if (value === undefined || value === null) return false;

  switch (field.type) {
    case "text":
    case "textarea":
    case "date":
      return typeof value === "string" && value.trim().length > 0;
    case "number":
      return typeof value === "number" || (typeof value === "string" && value.trim().length > 0);
    case "checkbox":
      return typeof value === "boolean";
    case "select":
      return typeof value === "string" && value.trim().length > 0;
    case "array":
      return Array.isArray(value) && value.length > 0;
    default:
      return false;
  }
}

export function validatePage(page: Page): ValidationResult {
  const template = getTemplateById(page.templateId);
  if (!template) {
    return {
      isComplete: true,
      totalFields: 0,
      completedFields: 0,
      missingFields: [],
    };
  }

  const requiredFields = template.fields.filter((f) => f.required);
  const fields = page.fields as Record<string, unknown>;
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (!isFieldFilled(fields[field.key], field)) {
      missingFields.push(field.label);
    }
  }

  const completedFields = requiredFields.length - missingFields.length;

  return {
    isComplete: missingFields.length === 0,
    totalFields: requiredFields.length,
    completedFields,
    missingFields,
  };
}

export function getCompletionPercentage(page: Page): number {
  const result = validatePage(page);
  if (result.totalFields === 0) return 100;
  return Math.round((result.completedFields / result.totalFields) * 100);
}
