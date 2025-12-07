import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { sparks, palettes } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { originalSparkId, targetPaletteId } = await req.json();

    if (!originalSparkId || !targetPaletteId) {
      return new Response("originalSparkId and targetPaletteId are required", { status: 400 });
    }

    // 1. Verify user owns target palette
    const [targetPalette] = await db
      .select()
      .from(palettes)
      .where(and(eq(palettes.id, targetPaletteId), eq(palettes.tenantId, session.user.tenantId)));

    if (!targetPalette) {
      return new Response("Target palette not found or unauthorized", { status: 403 });
    }

    // 2. Fetch original spark
    const [originalSpark] = await db
      .select()
      .from(sparks)
      .where(eq(sparks.id, originalSparkId));

    if (!originalSpark) {
      return new Response("Original spark not found", { status: 404 });
    }

    // 3. Create new spark (clone)
    const [newSpark] = await db
      .insert(sparks)
      .values({
        paletteId: targetPaletteId,
        title: originalSpark.title,
        description: originalSpark.description,
        imageUrl: originalSpark.imageUrl,
        sourceUrl: originalSpark.sourceUrl,
        imageWidth: originalSpark.imageWidth,
        imageHeight: originalSpark.imageHeight,
        tags: originalSpark.tags,
        originalSparkId: originalSparkId,
      })
      .returning();

    // 4. Increment saveCount on original spark (fire and forget)
    await db
      .update(sparks)
      .set({ saveCount: sql`${sparks.saveCount} + 1` })
      .where(eq(sparks.id, originalSparkId));

    return NextResponse.json(newSpark);
  } catch (error) {
    console.error("Failed to save spark:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
