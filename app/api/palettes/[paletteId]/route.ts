import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { palettes } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Update a palette
export async function PUT(req: Request, { params }: { params: { paletteId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { name, description } = await req.json();
    const { paletteId } = params;

    if (!name) {
      return new Response("Name is required", { status: 400 });
    }

    const [updatedPalette] = await db
      .update(palettes)
      .set({ name, description, updatedAt: new Date() })
      .where(and(eq(palettes.id, paletteId), eq(palettes.tenantId, session.user.tenantId)))
      .returning();

    if (!updatedPalette) {
      return new Response("Palette not found or you do not have permission to edit it.", { status: 404 });
    }

    return NextResponse.json(updatedPalette);
  } catch (error) {
    console.error("Failed to update palette:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Delete a palette
export async function DELETE(req: Request, { params }: { params: { paletteId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { paletteId } = params;

    const [deletedPalette] = await db
      .delete(palettes)
      .where(and(eq(palettes.id, paletteId), eq(palettes.tenantId, session.user.tenantId)))
      .returning();

    if (!deletedPalette) {
        return new Response("Palette not found or you do not have permission to delete it.", { status: 404 });
    }

    return new Response(null, { status: 204 }); // No Content
  } catch (error) {
    console.error("Failed to delete palette:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
