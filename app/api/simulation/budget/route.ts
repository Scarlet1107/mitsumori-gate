import { NextResponse } from "next/server";
import { calculateSimulation, type SimulationInput } from "@/lib/simulation/engine";
import { getTypedConfigs } from "@/lib/config-store";

const toNumber = (value: unknown): number => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
};

const toBoolean = (value: unknown): boolean | undefined => {
    return typeof value === "boolean" ? value : undefined;
};

function buildInput(payload: Record<string, unknown>): SimulationInput {
    return {
        age: toNumber(payload.age),
        spouseAge: payload.spouseAge === undefined ? undefined : toNumber(payload.spouseAge),
        hasSpouse: toBoolean(payload.hasSpouse),
        name: typeof payload.name === "string" ? payload.name : undefined,
        email: typeof payload.email === "string" ? payload.email : undefined,
        ownIncome: toNumber(payload.ownIncome),
        spouseIncome: payload.spouseIncome === undefined ? undefined : toNumber(payload.spouseIncome),
        ownLoanPayment: toNumber(payload.ownLoanPayment),
        spouseLoanPayment: payload.spouseLoanPayment === undefined ? undefined : toNumber(payload.spouseLoanPayment),
        downPayment: toNumber(payload.downPayment),
        wishMonthlyPayment: toNumber(payload.wishMonthlyPayment),
        wishPaymentYears: toNumber(payload.wishPaymentYears),
        usesBonus: toBoolean(payload.usesBonus),
        bonusPayment: payload.bonusPayment === undefined ? undefined : toNumber(payload.bonusPayment),
        hasLand: toBoolean(payload.hasLand),
        hasExistingBuilding: toBoolean(payload.hasExistingBuilding),
        hasLandBudget: toBoolean(payload.hasLandBudget),
        landBudget: payload.landBudget === undefined ? undefined : toNumber(payload.landBudget),
        usesTechnostructure: toBoolean(payload.usesTechnostructure),
        usesAdditionalInsulation: toBoolean(payload.usesAdditionalInsulation),
    };
}

export async function POST(request: Request) {
    try {
        const payload = await request.json() as Record<string, unknown>;
        const input = buildInput(payload);

        if (!Number.isFinite(input.age) || input.age <= 0 || !Number.isFinite(input.ownIncome) || input.ownIncome <= 0) {
            return NextResponse.json(
                { error: "必須フィールドが不足しています" },
                { status: 400 }
            );
        }

        const config = await getTypedConfigs();
        const result = calculateSimulation(input, config);
        const downPayment = Number.isFinite(input.downPayment) ? input.downPayment : 0;
        const totalBudget = result.maxLoanAmount + downPayment;

        const spouseAge = input.spouseAge ?? input.age;
        const maxAge = Math.max(input.age, spouseAge);
        const maxTermYears = Math.min(50, 80 - maxAge);
        const totalIncome = input.ownIncome + (input.spouseIncome ?? 0);
        const existingMonthlyPayment = input.ownLoanPayment + (input.spouseLoanPayment ?? 0);
        const existingAnnualPayment = existingMonthlyPayment * 12;
        const maxAnnualPayment = totalIncome * (config.dtiRatio / 100);
        const availableAnnualPayment = Math.max(0, maxAnnualPayment - existingAnnualPayment);
        const monthlyPaymentCapacity = availableAnnualPayment / 12;


        return NextResponse.json({
            maxLoanAmount: result.maxLoanAmount,
            downPayment,
            totalBudget,
        });
    } catch (error) {
        console.error("POST /api/simulation/budget failed:", error);
        return NextResponse.json(
            { error: "予算計算に失敗しました" },
            { status: 500 }
        );
    }
}
