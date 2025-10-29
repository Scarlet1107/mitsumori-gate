import { NextResponse } from "next/server";
import { findSimulation } from "@/lib/simulation-store";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const record = await findSimulation(id);

    if (!record) {
        return NextResponse.json(
            { error: { code: "NOT_FOUND", message: "simulation_not_found" } },
            { status: 404, headers: { "Cache-Control": "no-store" } }
        );
    }

    const payload = {
        id: record.id,
        created_at: record.createdAt.toISOString(),
        updated_at: record.updatedAt.toISOString(),
        age: record.age,
        postal_code: record.postalCode,
        income_husband: record.incomeHusband,
        income_wife: record.incomeWife,
        other_loan_annual_repay: record.otherLoanAnnualRepay,
        head_money: record.headMoney,
        has_land: record.hasLand,
        wish_monthly: record.wishMonthly,
        term_years_selected: record.termYearsSelected,
        term_years_effective: record.termYearsEffective,
        bonus_enabled: record.bonusEnabled,
        bonus_per_payment: record.bonusPerPayment,
        bonus_annual: record.bonusAnnual,
        bonus_monthly: record.bonusMonthly,
        wish_monthly_total: record.wishMonthlyTotal,
        household_annual_income: record.householdAnnualIncome,
        max_annual_debt: record.maxAnnualDebt,
        available_annual_for_this_loan: record.availableAnnualForThisLoan,
        available_monthly_for_this_loan: record.availableMonthlyForThisLoan,
        max_loan: record.maxLoan,
        wish_loan: record.wishLoan,
        ratio: record.ratio,
        budget_for_building: record.budgetForBuilding,
        tsubo: record.tsubo,
        square_meters: record.squareMeters,
        term_months: record.termMonths,
        monthly_rate: record.monthlyRate,
        max_term_by_age: record.maxTermByAge,
        config_annual_interest_rate: record.configAnnualInterestRate,
        config_max_term_years_cap: record.configMaxTermYearsCap,
        config_dti_ratio: record.configDtiRatio,
        config_unit_price_per_tsubo: record.configUnitPricePerTsubo,
    };

    return NextResponse.json(payload, {
        headers: { "Cache-Control": "no-store" },
    });
}
