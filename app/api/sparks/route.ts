import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { sparks, palettes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

// Create a new spark
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { paletteId, imageUrl, title, description, sourceUrl } = await req.json();

    if (!paletteId || !imageUrl) {
      return new Response("paletteId and imageUrl are required", { status: 400 });
    }

    // Verify the user owns the palette they are adding a spark to
    const [palette] = await db
      .select()
      .from(palettes)
      .where(and(eq(palettes.id, paletteId), eq(palettes.tenantId, session.user.tenantId)));

    if (!palette) {
      return new Response("Palette not found or you do not have permission to add to it.", { status: 404 });
    }

    const [newSpark] = await db
      .insert(sparks)
      .values({
        paletteId,
        imageUrl,
        title,
        description,
        sourceUrl,
      })
      .returning();

    return NextResponse.json(newSpark);
  } catch (error) {
    console.error("Failed to create spark:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
