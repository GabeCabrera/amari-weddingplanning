import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/config";
import { getTenantById, getPlannerByTenantId, getPagesByPlannerId } from "@/lib/db/queries";
import { HomeClient } from "./home-client";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const tenant = await getTenantById(session.user.tenantId);

  if (!tenant) {
    redirect("/login");
  }

  // If onboarding not complete, redirect to welcome
  if (!tenant.onboardingComplete) {
    redirect("/welcome");
  }

  // Check if they have a planner with pages
  const planner = await getPlannerByTenantId(tenant.id);
  const pages = planner ? await getPagesByPlannerId(planner.id) : [];
  const hasStartedPlanning = pages.length > 0;

  return (
    <HomeClient
      displayName={tenant.displayName}
      hasStartedPlanning={hasStartedPlanning}
    />
  );
}
