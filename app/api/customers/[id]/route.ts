import { NextResponse } from "next/server";
import { updateCustomer, CustomerUpdateInput, getCustomerById, deleteCustomer } from "@/lib/customer-store";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const customer = await getCustomerById(id);

        if (!customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }

        const baseAddress = customer.baseAddress ?? "";
        const detailAddress = customer.detailAddress ?? "";
        const combinedAddress = `${baseAddress}${detailAddress}`.trim();

        return NextResponse.json({
            ...customer,
            address: combinedAddress,
        });
    } catch (error) {
        console.error("GET /api/customers/[id] failed:", error);
        return NextResponse.json(
            { error: "顧客情報の取得に失敗しました" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const existing = await getCustomerById(id);
        if (!existing) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }
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

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await deleteCustomer(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/customers/[id] failed:", error);
        return NextResponse.json(
            { error: "顧客情報の削除に失敗しました" },
            { status: 500 }
        );
    }
}
