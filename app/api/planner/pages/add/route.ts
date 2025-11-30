import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getPlannerByTenantId, getPagesByPlannerId, createPage } from "@/lib/db/queries";
import { getTemplateById } from "@/lib/templates/registry";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { templateIds } = await request.json();

    if (!templateIds || !Array.isArray(templateIds) || templateIds.length === 0) {
      return NextResponse.json(
        { error: "At least one template is required" },
        { status: 400 }
      );
    }

    const planner = await getPlannerByTenantId(session.user.tenantId);

    if (!planner) {
      return NextResponse.json(
        { error: "Planner not found" },
        { status: 404 }
      );
    }

    // Get current pages to determine position
    const existingPages = await getPagesByPlannerId(planner.id);
    let nextPosition = existingPages.length;

    // Create pages for each template
    const createdPages = [];
    for (const templateId of templateIds) {
      const template = getTemplateById(templateId);

      if (!template) {
        console.warn(`Template not found: ${templateId}`);
        continue;
      }

      // Create default fields from template definition
      const defaultFields: Record<string, unknown> = {};
      for (const field of template.fields) {
        if (field.type === "array") {
          defaultFields[field.key] = [];
        } else if (field.type === "checkbox") {
          defaultFields[field.key] = false;
        } else {
          defaultFields[field.key] = "";
        }
      }

      const page = await createPage(
        planner.id,
        templateId,
        template.name,
        nextPosition,
        defaultFields
      );

      createdPages.push(page);
      nextPosition++;
    }

    return NextResponse.json({ success: true, pages: createdPages });
  } catch (error) {
    console.error("Add pages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
