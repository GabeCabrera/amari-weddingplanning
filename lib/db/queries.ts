import { db } from "./index";
import { eq, and } from "drizzle-orm";
import {
  tenants,
  users,
  planners,
  pages,
  passwordResetTokens,
  type Tenant,
  type User,
  type Planner,
  type Page,
} from "./schema";

// ============================================================================
// TENANT QUERIES
// ============================================================================

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const result = await db.query.tenants.findFirst({
    where: eq(tenants.slug, slug),
  });
  return result ?? null;
}

export async function getTenantById(id: string): Promise<Tenant | null> {
  const result = await db.query.tenants.findFirst({
    where: eq(tenants.id, id),
  });
  return result ?? null;
}

export async function updateTenantOnboarding(
  tenantId: string,
  complete: boolean
): Promise<void> {
  await db
    .update(tenants)
    .set({ onboardingComplete: complete, updatedAt: new Date() })
    .where(eq(tenants.id, tenantId));
}

// ============================================================================
// USER QUERIES
// ============================================================================

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });
  return result ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await db.query.users.findFirst({
    where: eq(users.id, id),
  });
  return result ?? null;
}

export async function updateUserPassword(
  userId: string,
  passwordHash: string
): Promise<void> {
  await db
    .update(users)
    .set({
      passwordHash,
      mustChangePassword: false,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

// ============================================================================
// PASSWORD RESET QUERIES
// ============================================================================

export async function createPasswordResetToken(
  userId: string,
  token: string,
  expiresAt: Date
): Promise<void> {
  // Delete any existing tokens for this user
  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.userId, userId));

  await db.insert(passwordResetTokens).values({
    userId,
    token,
    expiresAt,
  });
}

export async function getPasswordResetToken(token: string) {
  const result = await db.query.passwordResetTokens.findFirst({
    where: eq(passwordResetTokens.token, token),
  });
  return result ?? null;
}

export async function deletePasswordResetToken(token: string): Promise<void> {
  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token));
}

// ============================================================================
// PLANNER QUERIES
// ============================================================================

export async function getPlannerByTenantId(
  tenantId: string
): Promise<Planner | null> {
  const result = await db.query.planners.findFirst({
    where: eq(planners.tenantId, tenantId),
  });
  return result ?? null;
}

export async function createPlanner(tenantId: string): Promise<Planner> {
  const [planner] = await db
    .insert(planners)
    .values({ tenantId })
    .returning();
  return planner;
}

export async function getOrCreatePlanner(tenantId: string): Promise<Planner> {
  const existing = await getPlannerByTenantId(tenantId);
  if (existing) return existing;
  return createPlanner(tenantId);
}

// ============================================================================
// PAGE QUERIES
// ============================================================================

export async function getPagesByPlannerId(plannerId: string): Promise<Page[]> {
  const result = await db.query.pages.findMany({
    where: eq(pages.plannerId, plannerId),
    orderBy: (pages, { asc }) => [asc(pages.position)],
  });
  return result;
}

export async function getPageById(
  pageId: string,
  plannerId: string
): Promise<Page | null> {
  const result = await db.query.pages.findFirst({
    where: and(eq(pages.id, pageId), eq(pages.plannerId, plannerId)),
  });
  return result ?? null;
}

export async function createPage(
  plannerId: string,
  templateId: string,
  title: string,
  position: number,
  fields: Record<string, unknown> = {}
): Promise<Page> {
  const [page] = await db
    .insert(pages)
    .values({ plannerId, templateId, title, position, fields })
    .returning();
  return page;
}

export async function updatePageFields(
  pageId: string,
  fields: Record<string, unknown>
): Promise<void> {
  await db
    .update(pages)
    .set({ fields, updatedAt: new Date() })
    .where(eq(pages.id, pageId));
}

export async function updatePagePosition(
  pageId: string,
  position: number
): Promise<void> {
  await db
    .update(pages)
    .set({ position, updatedAt: new Date() })
    .where(eq(pages.id, pageId));
}

export async function updatePageTitle(
  pageId: string,
  title: string
): Promise<void> {
  await db
    .update(pages)
    .set({ title, updatedAt: new Date() })
    .where(eq(pages.id, pageId));
}

export async function deletePage(pageId: string): Promise<void> {
  await db.delete(pages).where(eq(pages.id, pageId));
}

export async function reorderPages(
  plannerId: string,
  pageIds: string[]
): Promise<void> {
  // Update positions based on array order
  await Promise.all(
    pageIds.map((pageId, index) =>
      db
        .update(pages)
        .set({ position: index, updatedAt: new Date() })
        .where(and(eq(pages.id, pageId), eq(pages.plannerId, plannerId)))
    )
  );
}
