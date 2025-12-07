import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { palettes, sparks, tenants } from "@/lib/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Fetch public palettes from OTHER tenants
    // We join with tenants to get the couple's name/display name
    const publicPalettes = await db
      .select({
        id: palettes.id,
        name: palettes.name,
        description: palettes.description,
        isPublic: palettes.isPublic,
        viewCount: palettes.viewCount,
        tenantName: tenants.displayName,
        createdAt: palettes.createdAt,
      })
      .from(palettes)
      .leftJoin(tenants, eq(palettes.tenantId, tenants.id))
      .where(
        and(
          eq(palettes.isPublic, true),
          ne(palettes.tenantId, session.user.tenantId) // Exclude my own
        )
      )
      .orderBy(desc(palettes.viewCount), desc(palettes.createdAt))
      .limit(50); // Limit for now

    // Ideally we'd fetch preview images for each palette too, but that's complex in one query without aggregate
    // For now, we can do a secondary fetch or just let the frontend handle loading details when clicked
    // OR, we fetch one spark image for each palette to show as a cover
    
    const palettesWithCovers = await Promise.all(
      publicPalettes.map(async (p) => {
        const [coverSpark] = await db
          .select({ imageUrl: sparks.imageUrl })
          .from(sparks)
          .where(eq(sparks.paletteId, p.id))
          .limit(1);
        
        return {
          ...p,
          coverImage: coverSpark?.imageUrl || null,
        };
      })
    );

    return NextResponse.json(palettesWithCovers);
  } catch (error) {
    console.error("Failed to fetch explore palettes:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
