import { NextResponse } from "next/server";
import { updateCustomer, CustomerUpdateInput } from "@/lib/customer-store";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json() as CustomerUpdateInput;
        const customer = await updateCustomer(id, body);

        return NextResponse.json({
            id: customer.id,
            updatedAt: customer.updatedAt.toISOString(),
        });
    } catch (error) {
        console.error("PUT /api/customers/[id] failed:", error);
        return NextResponse.json(
            { error: "顧客情報の更新に失敗しました" },
            { status: 500 }
        );
    }
}
