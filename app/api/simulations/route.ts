import { NextResponse } from "next/server";

import {
    calculateSimulation,
    createSimulationConfig,
    simulationInputSchema,
} from "@/lib/simulation";
import { saveSimulation } from "@/lib/simulation-store";
import { sendSimulationEmail } from "@/lib/simulation/email";

type ErrorBody = {
    error: {
        code: string;
        message: string;
    };
};

export async function POST(req: Request) {
    try {
        const json = await req.json();
        const parsed = simulationInputSchema.safeParse(json);

        if (!parsed.success) {
            const issue = parsed.error.issues[0];
            const payload: ErrorBody = {
                error: {
                    code: "BAD_REQUEST",
                    message: issue.message,
                },
            };
            return NextResponse.json(payload, { status: 400 });
        }

        const config = createSimulationConfig();
        const result = calculateSimulation(parsed.data, config);
        const record = await saveSimulation(parsed.data, result, config);

        await sendSimulationEmail(record);

        return NextResponse.json({
            id: record.id,
            createdAt: record.createdAt.toISOString(),
            updatedAt: record.updatedAt.toISOString(),
            inputs: {
                age: record.age,
                postalCode: record.postalCode,
                incomeHusband: record.incomeHusband,
                incomeWife: record.incomeWife,
                otherLoanAnnualRepay: record.otherLoanAnnualRepay,
                headMoney: record.headMoney,
                hasLand: record.hasLand,
                wishMonthly: record.wishMonthly,
                termYearsSelected: record.termYearsSelected,
                bonusEnabled: record.bonusEnabled,
                bonusPerPayment: record.bonusPerPayment,
            },
            results: {
                maxLoan: record.maxLoan,
                wishLoan: record.wishLoan,
                ratio: record.ratio,
                budgetForBuilding: record.budgetForBuilding,
                tsubo: record.tsubo,
                squareMeters: record.squareMeters,
                termYearsEffective: record.termYearsEffective,
                termMonths: record.termMonths,
                maxTermByAge: record.maxTermByAge,
            },
            config: {
                annualInterestRate: record.configAnnualInterestRate,
                maxTermYearsCap: record.configMaxTermYearsCap,
                dtiRatio: record.configDtiRatio,
                unitPricePerTsubo: record.configUnitPricePerTsubo,
            },
            meta: {
                bonusAnnual: record.bonusAnnual,
                bonusMonthly: record.bonusMonthly,
                wishMonthlyTotal: record.wishMonthlyTotal,
                householdAnnualIncome: record.householdAnnualIncome,
                maxAnnualDebt: record.maxAnnualDebt,
                availableAnnualForThisLoan: record.availableAnnualForThisLoan,
                availableMonthlyForThisLoan:
                    record.availableMonthlyForThisLoan,
                monthlyRate: record.monthlyRate,
            },
        });
    } catch (error) {
        console.error("POST /api/simulations failed", error);
        const payload: ErrorBody = {
            error: {
                code: "INTERNAL",
                message: "internal_error",
            },
        };
        return NextResponse.json(payload, { status: 500 });
    }
}
