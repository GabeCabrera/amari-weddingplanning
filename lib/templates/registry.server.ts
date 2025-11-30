import "server-only";

import { db } from "@/lib/db";
import { customTemplates as customTemplatesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  templates,
  type TemplateDefinition,
  type TemplateCategory,
  type TimelineFilter,
  type TemplateField,
} from "./registry";

// ============================================================================
// SERVER-ONLY DATABASE HELPERS - For custom templates
// ============================================================================

export async function getCustomTemplates(): Promise<TemplateDefinition[]> {
  const dbTemplates = await db
    .select()
    .from(customTemplatesTable)
    .where(eq(customTemplatesTable.isPublished, true));

  return dbTemplates.map((t) => ({
    id: t.templateId,
    name: t.name,
    description: t.description,
    category: t.category as TemplateCategory,
    timelineFilters: (t.timelineFilters as TimelineFilter[]) || [],
    icon: t.icon,
    fields: (t.fields as TemplateField[]) || [],
    isFree: t.isFree,
    isCustom: true,
  }));
}

export async function getAllTemplatesWithCustom(): Promise<TemplateDefinition[]> {
  const customTemplates = await getCustomTemplates();
  return [...templates, ...customTemplates];
}

export async function getMarketplaceTemplatesWithCustom(): Promise<TemplateDefinition[]> {
  const customTemplates = await getCustomTemplates();
  const builtIn = templates.filter((t) => t.id !== "cover");
  return [...builtIn, ...customTemplates];
}

export async function isTemplateFreeDynamic(templateId: string): Promise<boolean> {
  // Check built-in templates first
  const builtInTemplate = templates.find((t) => t.id === templateId);
  if (builtInTemplate) {
    return builtInTemplate.isFree ?? false;
  }

  // Check custom templates
  const customTemplates = await getCustomTemplates();
  const customTemplate = customTemplates.find((t) => t.id === templateId);
  return customTemplate?.isFree ?? false;
}
