import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Free tier AI message limit
export const FREE_AI_MESSAGE_LIMIT = 10;

// Subscription prices (set these in Stripe dashboard and copy the IDs here)
export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!, // $12/month
  yearly: process.env.STRIPE_PRICE_YEARLY!,   // $99/year
};

export type PlanType = "free" | "monthly" | "yearly";

export interface PlanAccess {
  plan: PlanType;
  hasFullAccess: boolean;
  hasAIAccess: boolean;
  aiMessagesUsed: number;
  aiMessagesRemaining: number | "unlimited";
  isLegacy: boolean;
  subscriptionStatus: string | null;
  subscriptionEndsAt: Date | null;
}

/**
 * Check what access a tenant has based on their plan
 */
export async function getTenantAccess(tenantId: string): Promise<PlanAccess | null> {
  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantId));

  if (!tenant) return null;

  const plan = tenant.plan as PlanType;
  const isSubscribed = tenant.subscriptionStatus === "active" || tenant.subscriptionStatus === "trialing";
  const isLegacy = tenant.hasLegacyAccess;
  
  // Full access if: subscribed, or legacy complete purchaser
  const hasFullAccess = isSubscribed || isLegacy;
  
  // AI access if: has full access, OR still has free messages remaining
  const aiMessagesUsed = tenant.aiMessagesUsed;
  const hasAIAccess = hasFullAccess || aiMessagesUsed < FREE_AI_MESSAGE_LIMIT;
  
  const aiMessagesRemaining = hasFullAccess 
    ? "unlimited" 
    : Math.max(0, FREE_AI_MESSAGE_LIMIT - aiMessagesUsed);

  return {
    plan,
    hasFullAccess,
    hasAIAccess,
    aiMessagesUsed,
    aiMessagesRemaining,
    isLegacy,
    subscriptionStatus: tenant.subscriptionStatus,
    subscriptionEndsAt: tenant.subscriptionEndsAt,
  };
}

/**
 * Increment AI message count for a tenant
 * Returns the new count, or null if they've hit the limit (free tier)
 */
export async function incrementAIUsage(tenantId: string): Promise<{ allowed: boolean; newCount: number; remaining: number | "unlimited" }> {
  const access = await getTenantAccess(tenantId);
  
  if (!access) {
    return { allowed: false, newCount: 0, remaining: 0 };
  }

  // Unlimited for paid users
  if (access.hasFullAccess) {
    // Still increment for tracking, but always allow
    await db
      .update(tenants)
      .set({ 
        aiMessagesUsed: access.aiMessagesUsed + 1,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId));
    
    return { allowed: true, newCount: access.aiMessagesUsed + 1, remaining: "unlimited" };
  }

  // Check limit for free users
  if (access.aiMessagesUsed >= FREE_AI_MESSAGE_LIMIT) {
    return { allowed: false, newCount: access.aiMessagesUsed, remaining: 0 };
  }

  // Increment and return
  const newCount = access.aiMessagesUsed + 1;
  await db
    .update(tenants)
    .set({ 
      aiMessagesUsed: newCount,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId));

  return { 
    allowed: true, 
    newCount, 
    remaining: FREE_AI_MESSAGE_LIMIT - newCount,
  };
}

/**
 * Check if a tenant can access a premium template
 */
export function canAccessTemplate(access: PlanAccess, templateIsFree: boolean): boolean {
  if (templateIsFree) return true;
  return access.hasFullAccess;
}

/**
 * Get display name for plan
 */
export function getPlanDisplayName(plan: PlanType, isLegacy: boolean): string {
  if (isLegacy) return "Complete (Legacy)";
  switch (plan) {
    case "monthly": return "AIsle Monthly";
    case "yearly": return "AIsle Yearly";
    default: return "Free";
  }
}
