import { NextResponse } from "next/server";
import { createCustomer, CustomerCreateInput } from "@/lib/customer-store";

export async function POST(request: Request) {
    try {
        const body = await request.json() as CustomerCreateInput;

        const customer = await createCustomer(body);

        return NextResponse.json({
            id: customer.id,
            createdAt: customer.createdAt.toISOString(),
        });
    } catch (error) {
        console.error("POST /api/customers failed:", error);
        return NextResponse.json(
            { error: "顧客情報の保存に失敗しました" },
            { status: 500 }
        );
    }
}
