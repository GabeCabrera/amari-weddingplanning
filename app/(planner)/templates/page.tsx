import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/config";
import { getPlannerByTenantId, getPagesByPlannerId, getTenantById } from "@/lib/db/queries";
import { getMarketplaceTemplatesWithCustom } from "@/lib/templates/registry.server";
import { TemplateMarketplace } from "./template-marketplace";

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Get tenant to check plan
  const tenant = await getTenantById(session.user.tenantId);
  const userPlan = tenant?.plan ?? "free";

  // Check if user already has a planner (adding pages vs creating new)
  const planner = await getPlannerByTenantId(session.user.tenantId);
  const existingPages = planner ? await getPagesByPlannerId(planner.id) : [];
  const existingTemplateIds = existingPages.map((p) => p.templateId);

  // Get all templates including custom ones from database
  const allTemplates = await getMarketplaceTemplatesWithCustom();

  return (
    <TemplateMarketplace
      isAddingPages={existingPages.length > 0}
      existingTemplateIds={existingTemplateIds}
      userPlan={userPlan as "free" | "complete"}
      templates={allTemplates}
    />
  );
}
