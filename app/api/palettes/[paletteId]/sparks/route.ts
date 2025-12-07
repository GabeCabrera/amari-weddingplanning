import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { sparks, palettes } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Get all sparks for a specific palette
export async function GET(req: Request, { params }: { params: { paletteId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const { paletteId } = params;

        // First, verify the user owns the palette
        const [palette] = await db.select().from(palettes).where(and(eq(palettes.id, paletteId), eq(palettes.tenantId, session.user.tenantId)));
        if (!palette) {
            return new Response("Palette not found or you do not have permission to view it.", { status: 404 });
        }

        const paletteSparks = await db.query.sparks.findMany({
            where: eq(sparks.paletteId, paletteId),
            orderBy: (sparks, { desc }) => [desc(sparks.createdAt)],
        });

        return NextResponse.json(paletteSparks);
    } catch (error) {
        console.error("Failed to fetch sparks:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
