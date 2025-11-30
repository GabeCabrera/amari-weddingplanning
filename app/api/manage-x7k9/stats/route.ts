import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { tenants, users, planners, pages, rsvpForms, rsvpResponses } from "@/lib/db/schema";
import { count, eq, gte, sql, desc, and, ne } from "drizzle-orm";

const ADMIN_EMAILS = ["gabecabr@gmail.com"];
const COMPLETE_PLAN_PRICE = 29; // $29 one-time
const TAX_RATE = 0.0; // Adjust based on your tax situation (0% for now, could be ~30% for self-employment)

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Date calculations
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisYearStart = new Date(now.getFullYear(), 0, 1);

    // ============================================================================
    // USER METRICS
    // ============================================================================
    
    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const totalUsers = totalUsersResult?.count || 0;

    const [totalTenantsResult] = await db.select({ count: count() }).from(tenants);
    const totalTenants = totalTenantsResult?.count || 0;

    const [newUsersThisWeekResult] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, thisWeekStart));
    const newUsersThisWeek = newUsersThisWeekResult?.count || 0;

    const [newUsersThisMonthResult] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, thisMonthStart));
    const newUsersThisMonth = newUsersThisMonthResult?.count || 0;

    const [newUsersLastMonthResult] = await db
      .select({ count: count() })
      .from(users)
      .where(and(
        gte(users.createdAt, lastMonthStart),
        sql`${users.createdAt} < ${thisMonthStart}`
      ));
    const newUsersLastMonth = newUsersLastMonthResult?.count || 0;

    // ============================================================================
    // PLAN DISTRIBUTION
    // ============================================================================

    const [freeTenantsResult] = await db
      .select({ count: count() })
      .from(tenants)
      .where(eq(tenants.plan, "free"));
    const freeTenants = freeTenantsResult?.count || 0;

    const [completeTenantsResult] = await db
      .select({ count: count() })
      .from(tenants)
      .where(eq(tenants.plan, "complete"));
    const completeTenants = completeTenantsResult?.count || 0;

    // ============================================================================
    // REVENUE METRICS
    // ============================================================================

    const totalRevenue = completeTenants * COMPLETE_PLAN_PRICE;

    const [completePurchasesThisMonthResult] = await db
      .select({ count: count() })
      .from(tenants)
      .where(and(
        eq(tenants.plan, "complete"),
        gte(tenants.updatedAt, thisMonthStart)
      ));
    const revenueThisMonth = (completePurchasesThisMonthResult?.count || 0) * COMPLETE_PLAN_PRICE;

    const [completePurchasesLastMonthResult] = await db
      .select({ count: count() })
      .from(tenants)
      .where(and(
        eq(tenants.plan, "complete"),
        gte(tenants.updatedAt, lastMonthStart),
        sql`${tenants.updatedAt} < ${thisMonthStart}`
      ));
    const revenueLastMonth = (completePurchasesLastMonthResult?.count || 0) * COMPLETE_PLAN_PRICE;

    const [completePurchasesThisYearResult] = await db
      .select({ count: count() })
      .from(tenants)
      .where(and(
        eq(tenants.plan, "complete"),
        gte(tenants.updatedAt, thisYearStart)
      ));
    const revenueThisYear = (completePurchasesThisYearResult?.count || 0) * COMPLETE_PLAN_PRICE;

    const conversionRate = totalTenants > 0 
      ? ((completeTenants / totalTenants) * 100).toFixed(1) 
      : "0";

    // ============================================================================
    // TAX ESTIMATES
    // ============================================================================

    const estimatedTaxThisYear = revenueThisYear * TAX_RATE;
    const netRevenueThisYear = revenueThisYear - estimatedTaxThisYear;

    // ============================================================================
    // ENGAGEMENT METRICS
    // ============================================================================

    const [totalPagesResult] = await db.select({ count: count() }).from(pages);
    const totalPages = totalPagesResult?.count || 0;

    const [totalRsvpFormsResult] = await db.select({ count: count() }).from(rsvpForms);
    const totalRsvpForms = totalRsvpFormsResult?.count || 0;

    const [totalRsvpResponsesResult] = await db.select({ count: count() }).from(rsvpResponses);
    const totalRsvpResponses = totalRsvpResponsesResult?.count || 0;

    const [totalPlannersResult] = await db.select({ count: count() }).from(planners);
    const totalPlanners = totalPlannersResult?.count || 0;
    const avgPagesPerPlanner = totalPlanners > 0 
      ? (totalPages / totalPlanners).toFixed(1) 
      : "0";

    // ============================================================================
    // TEMPLATE USAGE ANALYTICS
    // ============================================================================

    // Get all pages with their template IDs (excluding cover)
    const allPages = await db
      .select({
        templateId: pages.templateId,
        fields: pages.fields,
        plannerId: pages.plannerId,
      })
      .from(pages)
      .where(ne(pages.templateId, "cover"));

    // Count template usage
    const templateUsage: Record<string, number> = {};
    allPages.forEach(page => {
      templateUsage[page.templateId] = (templateUsage[page.templateId] || 0) + 1;
    });

    // Sort by usage
    const templateRankings = Object.entries(templateUsage)
      .map(([templateId, usageCount]) => ({ templateId, count: usageCount }))
      .sort((a, b) => b.count - a.count);

    // ============================================================================
    // TEMPLATE FIELD COMPLETION ANALYSIS
    // ============================================================================

    // Analyze how "filled out" each template type is on average
    const templateCompletion: Record<string, { total: number; filledFields: number; pageCount: number }> = {};
    
    allPages.forEach(page => {
      const fields = page.fields as Record<string, unknown>;
      const fieldKeys = Object.keys(fields);
      const filledFields = fieldKeys.filter(key => {
        const value = fields[key];
        if (value === null || value === undefined || value === "") return false;
        if (Array.isArray(value) && value.length === 0) return false;
        if (typeof value === "object" && Object.keys(value as object).length === 0) return false;
        return true;
      }).length;

      if (!templateCompletion[page.templateId]) {
        templateCompletion[page.templateId] = { total: 0, filledFields: 0, pageCount: 0 };
      }
      templateCompletion[page.templateId].total += fieldKeys.length;
      templateCompletion[page.templateId].filledFields += filledFields;
      templateCompletion[page.templateId].pageCount += 1;
    });

    const templateEngagement = Object.entries(templateCompletion)
      .map(([templateId, data]) => ({
        templateId,
        avgCompletion: data.total > 0 
          ? Math.round((data.filledFields / data.total) * 100) 
          : 0,
        pageCount: data.pageCount,
      }))
      .sort((a, b) => b.avgCompletion - a.avgCompletion);

    // ============================================================================
    // GUEST LIST INSIGHTS (Anonymized & Aggregated)
    // ============================================================================

    const guestListPages = allPages.filter(p => p.templateId === "guest-list");
    let totalGuests = 0;
    let totalConfirmed = 0;
    let totalWithMeals = 0;
    let totalWithDietary = 0;
    let guestListsWithData = 0;

    guestListPages.forEach(page => {
      const fields = page.fields as Record<string, unknown>;
      const guests = fields.guests as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(guests) && guests.length > 0) {
        guestListsWithData++;
        totalGuests += guests.length;
        guests.forEach(guest => {
          if (guest.rsvp === true) totalConfirmed++;
          if (guest.meal) totalWithMeals++;
          if (guest.dietaryRestrictions) totalWithDietary++;
        });
      }
    });

    const avgGuestsPerWedding = guestListsWithData > 0 
      ? Math.round(totalGuests / guestListsWithData) 
      : 0;
    const avgRsvpRate = totalGuests > 0 
      ? Math.round((totalConfirmed / totalGuests) * 100) 
      : 0;

    // ============================================================================
    // BUDGET INSIGHTS (Anonymized & Aggregated)
    // ============================================================================

    const budgetPages = allPages.filter(p => p.templateId === "budget");
    let totalBudgetAmount = 0;
    let totalAllocated = 0;
    let totalPaidAmount = 0;
    let budgetsWithData = 0;
    const categorySpending: Record<string, number> = {};

    budgetPages.forEach(page => {
      const fields = page.fields as Record<string, unknown>;
      const budget = parseFloat(fields.totalBudget as string) || 0;
      const items = fields.items as Array<Record<string, unknown>> | undefined;
      
      if (budget > 0 || (Array.isArray(items) && items.length > 0)) {
        budgetsWithData++;
        totalBudgetAmount += budget;
        
        if (Array.isArray(items)) {
          items.forEach(item => {
            const cost = parseFloat(item.totalCost as string) || 0;
            const paid = parseFloat(item.amountPaid as string) || 0;
            const category = (item.category as string) || "Other";
            
            totalAllocated += cost;
            totalPaidAmount += paid;
            categorySpending[category] = (categorySpending[category] || 0) + cost;
          });
        }
      }
    });

    const avgBudget = budgetsWithData > 0 
      ? Math.round(totalBudgetAmount / budgetsWithData) 
      : 0;
    const avgAllocated = budgetsWithData > 0 
      ? Math.round(totalAllocated / budgetsWithData) 
      : 0;

    // Top spending categories
    const topCategories = Object.entries(categorySpending)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // ============================================================================
    // VENDOR INSIGHTS (Anonymized & Aggregated)
    // ============================================================================

    const vendorPages = allPages.filter(p => p.templateId === "vendor-contacts");
    let totalVendors = 0;
    let vendorsBooked = 0;
    let vendorsWithContracts = 0;
    const vendorCategories: Record<string, number> = {};

    vendorPages.forEach(page => {
      const fields = page.fields as Record<string, unknown>;
      const vendors = fields.vendors as Array<Record<string, unknown>> | undefined;
      
      if (Array.isArray(vendors)) {
        totalVendors += vendors.length;
        vendors.forEach(vendor => {
          const category = (vendor.category as string) || "Other";
          vendorCategories[category] = (vendorCategories[category] || 0) + 1;
          if (vendor.contractStatus === "signed") vendorsWithContracts++;
          if (vendor.contractStatus === "signed" || vendor.depositPaid) vendorsBooked++;
        });
      }
    });

    const topVendorCategories = Object.entries(vendorCategories)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // ============================================================================
    // RSVP FORM FIELD PREFERENCES
    // ============================================================================

    const allRsvpForms = await db.select({ fields: rsvpForms.fields }).from(rsvpForms);
    const rsvpFieldUsage: Record<string, number> = {};

    allRsvpForms.forEach(form => {
      const fields = form.fields as Record<string, boolean>;
      Object.entries(fields).forEach(([field, enabled]) => {
        if (enabled) {
          rsvpFieldUsage[field] = (rsvpFieldUsage[field] || 0) + 1;
        }
      });
    });

    const rsvpFieldPreferences = Object.entries(rsvpFieldUsage)
      .map(([field, count]) => ({ 
        field, 
        count,
        percentage: allRsvpForms.length > 0 
          ? Math.round((count / allRsvpForms.length) * 100) 
          : 0
      }))
      .sort((a, b) => b.count - a.count);

    // ============================================================================
    // FEATURE ADOPTION RATES
    // ============================================================================

    // What % of users create RSVP forms?
    const rsvpAdoptionRate = totalPlanners > 0 
      ? Math.round((totalRsvpForms / totalPlanners) * 100) 
      : 0;

    // What % of users use budget tracking?
    const budgetAdoptionRate = totalPlanners > 0 
      ? Math.round((budgetPages.length / totalPlanners) * 100) 
      : 0;

    // What % of users use vendor contacts?
    const vendorAdoptionRate = totalPlanners > 0 
      ? Math.round((vendorPages.length / totalPlanners) * 100) 
      : 0;

    // What % of users use seating chart?
    const seatingPages = allPages.filter(p => p.templateId === "seating-chart");
    const seatingAdoptionRate = totalPlanners > 0 
      ? Math.round((seatingPages.length / totalPlanners) * 100) 
      : 0;

    // ============================================================================
    // RECENT ACTIVITY
    // ============================================================================

    const recentSignups = await db
      .select({
        id: tenants.id,
        displayName: tenants.displayName,
        plan: tenants.plan,
        createdAt: tenants.createdAt,
      })
      .from(tenants)
      .orderBy(desc(tenants.createdAt))
      .limit(10);

    const recentUpgrades = await db
      .select({
        id: tenants.id,
        displayName: tenants.displayName,
        updatedAt: tenants.updatedAt,
      })
      .from(tenants)
      .where(eq(tenants.plan, "complete"))
      .orderBy(desc(tenants.updatedAt))
      .limit(10);

    // ============================================================================
    // MONTHLY TRENDS (last 6 months)
    // ============================================================================

    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const [signupsResult] = await db
        .select({ count: count() })
        .from(tenants)
        .where(and(
          gte(tenants.createdAt, monthStart),
          sql`${tenants.createdAt} <= ${monthEnd}`
        ));

      const [upgradesResult] = await db
        .select({ count: count() })
        .from(tenants)
        .where(and(
          eq(tenants.plan, "complete"),
          gte(tenants.updatedAt, monthStart),
          sql`${tenants.updatedAt} <= ${monthEnd}`
        ));

      monthlyData.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        signups: signupsResult?.count || 0,
        upgrades: upgradesResult?.count || 0,
        revenue: (upgradesResult?.count || 0) * COMPLETE_PLAN_PRICE,
      });
    }

    // ============================================================================
    // RESPONSE
    // ============================================================================

    return NextResponse.json({
      users: {
        total: totalUsers,
        totalTenants,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
        newLastMonth: newUsersLastMonth,
        monthOverMonthGrowth: newUsersLastMonth > 0 
          ? (((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100).toFixed(1)
          : newUsersThisMonth > 0 ? "100" : "0",
      },
      plans: {
        free: freeTenants,
        complete: completeTenants,
        conversionRate,
      },
      revenue: {
        total: totalRevenue,
        thisMonth: revenueThisMonth,
        lastMonth: revenueLastMonth,
        thisYear: revenueThisYear,
        monthOverMonthGrowth: revenueLastMonth > 0
          ? (((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100).toFixed(1)
          : revenueThisMonth > 0 ? "100" : "0",
        pricePerUnit: COMPLETE_PLAN_PRICE,
      },
      taxes: {
        rate: TAX_RATE,
        estimatedThisYear: estimatedTaxThisYear,
        netRevenueThisYear,
      },
      engagement: {
        totalPages,
        totalPlanners,
        avgPagesPerPlanner,
        totalRsvpForms,
        totalRsvpResponses,
      },
      // NEW: Product insights
      productInsights: {
        templateUsage: {
          rankings: templateRankings.slice(0, 10),
          engagement: templateEngagement,
        },
        guestList: {
          avgGuestsPerWedding,
          avgRsvpRate,
          totalGuests,
          totalConfirmed,
          weddingsWithData: guestListsWithData,
        },
        budget: {
          avgBudget,
          avgAllocated,
          totalTracked: totalBudgetAmount,
          topCategories,
          weddingsWithData: budgetsWithData,
        },
        vendors: {
          totalTracked: totalVendors,
          bookedRate: totalVendors > 0 ? Math.round((vendorsBooked / totalVendors) * 100) : 0,
          contractRate: totalVendors > 0 ? Math.round((vendorsWithContracts / totalVendors) * 100) : 0,
          topCategories: topVendorCategories,
        },
        rsvpForms: {
          fieldPreferences: rsvpFieldPreferences,
          avgResponseRate: totalRsvpForms > 0 
            ? Math.round(totalRsvpResponses / totalRsvpForms) 
            : 0,
        },
        featureAdoption: {
          rsvp: rsvpAdoptionRate,
          budget: budgetAdoptionRate,
          vendors: vendorAdoptionRate,
          seating: seatingAdoptionRate,
        },
      },
      activity: {
        recentSignups,
        recentUpgrades,
      },
      trends: {
        monthly: monthlyData,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
