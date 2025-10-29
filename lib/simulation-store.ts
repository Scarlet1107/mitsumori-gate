import { prisma } from "@/lib/prisma";
import type { SimulationConfig } from "@/lib/simulation/config";
import type { SimulationInput } from "@/lib/simulation/schema";
import type { SimulationResult } from "@/lib/simulation/calculator";
import { Prisma } from "@/lib/generated/prisma";

export type SimulationRecord = Prisma.SimulationGetPayload<{
    select: {
        id: true;
        createdAt: true;
        updatedAt: true;
        age: true;
        postalCode: true;
        incomeHusband: true;
        incomeWife: true;
        otherLoanAnnualRepay: true;
        headMoney: true;
        hasLand: true;
        wishMonthly: true;
        termYearsSelected: true;
        termYearsEffective: true;
        bonusEnabled: true;
        bonusPerPayment: true;
        bonusAnnual: true;
        bonusMonthly: true;
        wishMonthlyTotal: true;
        householdAnnualIncome: true;
        maxAnnualDebt: true;
        availableAnnualForThisLoan: true;
        availableMonthlyForThisLoan: true;
        maxLoan: true;
        wishLoan: true;
        ratio: true;
        budgetForBuilding: true;
        tsubo: true;
        squareMeters: true;
        termMonths: true;
        monthlyRate: true;
        maxTermByAge: true;
        configAnnualInterestRate: true;
        configMaxTermYearsCap: true;
        configDtiRatio: true;
        configUnitPricePerTsubo: true;
    };
}>;

function roundCurrency(value: number) {
    return Math.round(value);
}

function roundDecimal(value: number, precision = 2) {
    if (!Number.isFinite(value)) {
        return 0;
    }
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
}

export async function saveSimulation(
    input: SimulationInput,
    result: SimulationResult,
    config: SimulationConfig
): Promise<SimulationRecord> {
    return prisma.simulation.create({
        data: {
            age: input.age,
            postalCode: input.postalCode,
            incomeHusband: input.incomeHusband,
            incomeWife: input.incomeWife,
            otherLoanAnnualRepay: input.otherLoanAnnualRepay,
            headMoney: input.headMoney,
            hasLand: input.hasLand,
            wishMonthly: input.wishMonthly,
            termYearsSelected: input.termYearsSelected,
            termYearsEffective: result.termYearsEffective,
            bonusEnabled: input.bonusEnabled,
            bonusPerPayment: input.bonusPerPayment,
            bonusAnnual: result.bonusAnnual,
            bonusMonthly: roundDecimal(result.bonusMonthly),
            wishMonthlyTotal: roundDecimal(result.wishMonthlyTotal),
            householdAnnualIncome: result.householdAnnualIncome,
            maxAnnualDebt: roundDecimal(result.maxAnnualDebt),
            availableAnnualForThisLoan: roundDecimal(
                result.availableAnnualForThisLoan
            ),
            availableMonthlyForThisLoan: roundDecimal(
                result.availableMonthlyForThisLoan
            ),
            maxLoan: roundCurrency(result.maxLoan),
            wishLoan: roundCurrency(result.wishLoan),
            ratio: roundDecimal(result.ratio, 4),
            budgetForBuilding: roundCurrency(result.budgetForBuilding),
            tsubo: roundDecimal(result.tsubo, 3),
            squareMeters: roundDecimal(result.squareMeters, 3),
            termMonths: result.termMonths,
            monthlyRate: roundDecimal(result.monthlyRate, 6),
            maxTermByAge: result.maxTermByAge,
            configAnnualInterestRate: roundDecimal(
                config.annualInterestRate,
                6
            ),
            configMaxTermYearsCap: config.maxTermYearsCap,
            configDtiRatio: roundDecimal(config.dtiRatio, 4),
            configUnitPricePerTsubo: config.unitPricePerTsubo,
        },
        select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            age: true,
            postalCode: true,
            incomeHusband: true,
            incomeWife: true,
            otherLoanAnnualRepay: true,
            headMoney: true,
            hasLand: true,
            wishMonthly: true,
            termYearsSelected: true,
            termYearsEffective: true,
            bonusEnabled: true,
            bonusPerPayment: true,
            bonusAnnual: true,
            bonusMonthly: true,
            wishMonthlyTotal: true,
            householdAnnualIncome: true,
            maxAnnualDebt: true,
            availableAnnualForThisLoan: true,
            availableMonthlyForThisLoan: true,
            maxLoan: true,
            wishLoan: true,
            ratio: true,
            budgetForBuilding: true,
            tsubo: true,
            squareMeters: true,
            termMonths: true,
            monthlyRate: true,
            maxTermByAge: true,
            configAnnualInterestRate: true,
            configMaxTermYearsCap: true,
            configDtiRatio: true,
            configUnitPricePerTsubo: true,
        },
    });
}
