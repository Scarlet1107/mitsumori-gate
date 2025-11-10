import { NextResponse } from "next/server";
import { findCustomersByNameOrEmail, getRecentCustomers } from "@/lib/customer-store";
import type { Customer } from "@/lib/generated/prisma";
import type { CustomerSearchResult } from "@/lib/inperson-form-config";

const toStringValue = (value?: number | null) => {
    if (value === null || value === undefined) return "";
    return String(value);
};

function serializeCustomers(customers: Customer[]): CustomerSearchResult[] {
    return customers.map(customer => {
        const baseAddress = customer.baseAddress ?? "";
        const detailAddress = customer.detailAddress ?? "";
        const combinedAddress = `${baseAddress}${detailAddress}`.trim();

        return {
            id: customer.id,
            name: customer.name,
            email: customer.email ?? "",
            phone: customer.phone ?? "",
            age: toStringValue(customer.age),
            postalCode: customer.postalCode ?? "",
            baseAddress,
            detailAddress,
            address: combinedAddress,
            hasSpouse: customer.hasSpouse ?? null,
            spouseName: customer.spouseName ?? "",
            ownIncome: toStringValue(customer.ownIncome),
            ownLoanPayment: toStringValue(customer.ownLoanPayment),
            spouseIncome: toStringValue(customer.spouseIncome),
            spouseLoanPayment: toStringValue(customer.spouseLoanPayment),
            downPayment: toStringValue(customer.downPayment),
            wishMonthlyPayment: toStringValue(customer.wishMonthlyPayment),
            wishPaymentYears: toStringValue(customer.wishPaymentYears),
            usesBonus: customer.usesBonus ?? null,
            hasLand: customer.hasLand ?? null,
            usesTechnostructure: customer.usesTechnostructure ?? null,
            bonusPayment: toStringValue(customer.bonusPayment),
            createdAt: customer.createdAt instanceof Date
                ? customer.createdAt.toISOString()
                : customer.createdAt,
        };
    });
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = (searchParams.get("query") ?? searchParams.get("q") ?? "").trim();

        // クエリがない場合は最新の顧客を返す（デフォルト表示）
        if (!query) {
            const customers = await getRecentCustomers(5);
            return NextResponse.json({ customers: serializeCustomers(customers) });
        }

        // クエリがある場合は名前・メールアドレスで検索
        const customers = await findCustomersByNameOrEmail(query, 5);
        return NextResponse.json({ customers: serializeCustomers(customers) });
    } catch (error) {
        console.error("GET /api/customers/search failed:", error);
        return NextResponse.json(
            { error: "顧客検索に失敗しました" },
            { status: 500 }
        );
    }
}
