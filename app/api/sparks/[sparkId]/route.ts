import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { sparks, palettes } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Get a single spark
export async function GET(req: Request, { params }: { params: { sparkId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const { sparkId } = params;
        const [spark] = await db.select().from(sparks).where(eq(sparks.id, sparkId));

        if (!spark) {
            return new Response("Spark not found", { status: 404 });
        }
        
        // Verify the user owns the palette this spark belongs to
        const [palette] = await db.select().from(palettes).where(and(eq(palettes.id, spark.paletteId), eq(palettes.tenantId, session.user.tenantId)));
        if (!palette) {
            return new Response("Unauthorized", { status: 401 });
        }

        return NextResponse.json(spark);
    } catch (error) {
        console.error("Failed to fetch spark:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}


// Delete a spark
export async function DELETE(req: Request, { params }: { params: { sparkId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { sparkId } = params;
    
    // First get the spark to verify ownership via the palette
    const [spark] = await db.select().from(sparks).where(eq(sparks.id, sparkId));

    if (!spark) {
        return new Response("Spark not found", { status: 404 });
    }

    // Verify the user owns the palette this spark belongs to
    const [palette] = await db.select().from(palettes).where(and(eq(palettes.id, spark.paletteId), eq(palettes.tenantId, session.user.tenantId)));

    if (!palette) {
        return new Response("Unauthorized to delete this spark", { status: 403 });
    }

    // If ownership is confirmed, delete the spark
    await db.delete(sparks).where(eq(sparks.id, sparkId));

    return new Response(null, { status: 204 }); // No Content
  } catch (error) {
    console.error("Failed to delete spark:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Update a spark (edit details or move to another palette)
export async function PATCH(req: Request, { params }: { params: { sparkId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { sparkId } = params;
    const body = await req.json();
    const { title, description, tags, paletteId } = body;

    // 1. Verify ownership of the spark (via its current palette)
    const [existingSpark] = await db.select().from(sparks).where(eq(sparks.id, sparkId));
    if (!existingSpark) return new Response("Spark not found", { status: 404 });

    const [currentPalette] = await db
      .select()
      .from(palettes)
      .where(and(eq(palettes.id, existingSpark.paletteId), eq(palettes.tenantId, session.user.tenantId)));

    if (!currentPalette) return new Response("Unauthorized", { status: 403 });

    // 2. If moving to a new palette, verify ownership of the new palette
    if (paletteId && paletteId !== existingSpark.paletteId) {
      const [newPalette] = await db
        .select()
        .from(palettes)
        .where(and(eq(palettes.id, paletteId), eq(palettes.tenantId, session.user.tenantId)));
      
      if (!newPalette) return new Response("Unauthorized target palette", { status: 403 });
    }

    // 3. Update the spark
    const [updatedSpark] = await db
      .update(sparks)
      .set({
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(tags !== undefined && { tags }),
        ...(paletteId !== undefined && { paletteId }),
      })
      .where(eq(sparks.id, sparkId))
      .returning();

    return NextResponse.json(updatedSpark);
  } catch (error) {
    console.error("Failed to update spark:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}