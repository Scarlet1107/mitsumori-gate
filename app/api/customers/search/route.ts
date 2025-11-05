import { NextResponse } from "next/server";
import { findCustomersByNameOrEmail, getRecentCustomers } from "@/lib/customer-store";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query");

        // クエリがない場合は最新の顧客を返す（デフォルト表示）
        if (!query || query.trim() === "") {
            const customers = await getRecentCustomers(5);
            return NextResponse.json(customers);
        }

        // クエリがある場合は名前・メールアドレスで検索
        const customers = await findCustomersByNameOrEmail(query.trim());
        return NextResponse.json(customers);
    } catch (error) {
        console.error("GET /api/customers/search failed:", error);
        return NextResponse.json(
            { error: "顧客検索に失敗しました" },
            { status: 500 }
        );
    }
}
