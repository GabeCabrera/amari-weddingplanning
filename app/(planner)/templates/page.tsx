import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/config";
import { getPlannerByTenantId, getPagesByPlannerId } from "@/lib/db/queries";
import { TemplateMarketplace } from "./template-marketplace";

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Check if user already has a planner (adding pages vs creating new)
  const planner = await getPlannerByTenantId(session.user.tenantId);
  const existingPages = planner ? await getPagesByPlannerId(planner.id) : [];
  const existingTemplateIds = existingPages.map((p) => p.templateId);

  return (
    <TemplateMarketplace
      isAddingPages={existingPages.length > 0}
      existingTemplateIds={existingTemplateIds}
    />
  );
}
