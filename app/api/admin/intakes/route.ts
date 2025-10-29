import { NextResponse } from "next/server";
import { listSimulations } from "@/lib/simulation-store";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor") ?? undefined;

    const limit = Number.parseInt(limitParam ?? "20", 10);
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 20;

    const { items, nextCursor } = await listSimulations({ limit: safeLimit, cursor });

    return NextResponse.json(
        {
            items: items.map((item) => ({
                id: item.id,
                created_at: item.createdAt.toISOString(),
                household_annual_income: item.householdAnnualIncome,
                max_loan: item.maxLoan,
                wish_loan: item.wishLoan,
                ratio: item.ratio,
                term_years_selected: item.termYearsSelected,
                wish_monthly: item.wishMonthly,
                bonus_enabled: item.bonusEnabled,
            })),
            nextCursor: nextCursor ?? null,
        },
        { headers: { "Cache-Control": "no-store" } }
    );
}
