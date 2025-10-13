import { NextResponse } from "next/server";
import { listIntakes } from "@/lib/intake-store";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor") ?? undefined;

    const limit = Number.parseInt(limitParam ?? "20", 10);
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 20;

    const { items, nextCursor } = await listIntakes({ limit: safeLimit, cursor });

    return NextResponse.json(
        {
            items: items.map((item) => ({
                id: item.id,
                customer_name: item.customerName,
                created_at: item.createdAt.toISOString(),
                status: item.status,
            })),
            nextCursor: nextCursor ?? null,
        },
        { headers: { "Cache-Control": "no-store" } }
    );
}
