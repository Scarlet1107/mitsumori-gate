import { NextResponse } from "next/server";
import { getAdminCustomers } from "@/lib/customer-store";

const parseNumber = (value: string | null, fallback: number) => {
    if (!value) return fallback;
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
};

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = (searchParams.get("query") ?? searchParams.get("q") ?? "").trim();
        const page = Math.max(parseNumber(searchParams.get("page"), 0), 0);
        const limit = Math.min(Math.max(parseNumber(searchParams.get("limit"), 10), 1), 50);
        const offset = page * limit;

        const { customers, total } = await getAdminCustomers({ query, limit, offset });

        const serializedCustomers = customers.map(customer => ({
            id: customer.id,
            name: customer.name,
            email: customer.email ?? "",
            phone: customer.phone ?? "",
            inputMode: customer.inputMode ?? "",
            createdAt: customer.createdAt.toISOString(),
            webCompleted: customer.webCompleted,
            inPersonCompleted: customer.inPersonCompleted,
        }));

        return NextResponse.json({ customers: serializedCustomers, total });
    } catch (error) {
        console.error("GET /api/admin/customers failed:", error);
        return NextResponse.json(
            { error: "顧客一覧の取得に失敗しました" },
            { status: 500 }
        );
    }
}
