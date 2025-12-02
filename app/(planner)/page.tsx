import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth/config";
import { getTenantById, getPlannerByTenantId, getPagesByPlannerId } from "@/lib/db/queries";
import { HomeClient } from "./home-client";
import { LandingPage } from "./landing-page";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  // If not logged in, show landing page
  if (!session?.user?.tenantId) {
    return <LandingPage />;
  }

  // User is logged in - get their tenant
  const tenant = await getTenantById(session.user.tenantId);

  if (!tenant) {
    redirect("/login");
  }

  // If onboarding not complete, redirect to welcome (Hera conversation)
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
