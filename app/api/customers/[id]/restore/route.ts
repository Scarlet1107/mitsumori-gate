import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.customer.update({
            where: { id },
            data: { deletedAt: null },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("POST /api/customers/[id]/restore failed:", error);
        return NextResponse.json(
            { error: "顧客情報の復元に失敗しました" },
            { status: 500 }
        );
    }
}
