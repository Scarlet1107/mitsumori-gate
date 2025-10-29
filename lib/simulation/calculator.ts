import type { SimulationConfig } from "@/lib/simulation/config";
import type { SimulationInput } from "@/lib/simulation/schema";

const SQM_PER_TSUBO = 3.305785;

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function amortizationPresentValue(
    monthlyPayment: number,
    monthlyRate: number,
    termMonths: number
) {
    if (termMonths <= 0 || monthlyPayment <= 0) {
        return 0;
    }

    if (monthlyRate === 0) {
        return monthlyPayment * termMonths;
    }

    const discountFactor =
        (1 - Math.pow(1 + monthlyRate, -termMonths)) / monthlyRate;
    return monthlyPayment * discountFactor;
}

export interface SimulationResult {
    maxLoan: number;
    wishLoan: number;
    ratio: number;
    budgetForBuilding: number;
    tsubo: number;
    squareMeters: number;
    householdAnnualIncome: number;
    maxAnnualDebt: number;
    availableAnnualForThisLoan: number;
    availableMonthlyForThisLoan: number;
    wishMonthlyTotal: number;
    bonusAnnual: number;
    bonusMonthly: number;
    termYearsEffective: number;
    termMonths: number;
    monthlyRate: number;
    maxTermByAge: number;
}

export function calculateSimulation(
    input: SimulationInput,
    config: SimulationConfig
): SimulationResult {
    const householdAnnualIncome = input.incomeHusband + input.incomeWife;
    const maxTermByAge = Math.min(
        config.maxTermYearsCap,
        Math.max(0, 80 - input.age)
    );
    const termYearsEffective = Math.min(input.termYearsSelected, maxTermByAge);
    const termMonths = termYearsEffective * 12;
    const monthlyRate = config.annualInterestRate / 12;

    const maxAnnualDebt = householdAnnualIncome * config.dtiRatio;
    const availableAnnualForThisLoan = Math.max(
        0,
        maxAnnualDebt - input.otherLoanAnnualRepay
    );
    const availableMonthlyForThisLoan = availableAnnualForThisLoan / 12;

    const bonusAnnual = input.bonusPerPayment * 2;
    const bonusMonthly = bonusAnnual / 12;
    const wishMonthlyTotal = input.wishMonthly + bonusMonthly;

    const maxLoan = amortizationPresentValue(
        availableMonthlyForThisLoan,
        monthlyRate,
        termMonths
    );
    const wishLoan = amortizationPresentValue(
        wishMonthlyTotal,
        monthlyRate,
        termMonths
    );
    const budgetForBuilding = input.headMoney + wishLoan;
    const tsubo =
        config.unitPricePerTsubo === 0
            ? 0
            : budgetForBuilding / config.unitPricePerTsubo;
    const squareMeters = tsubo * SQM_PER_TSUBO;

    const ratio =
        maxLoan === 0 ? 0 : clamp(wishLoan / maxLoan, 0, Number.POSITIVE_INFINITY);

    return {
        maxLoan,
        wishLoan,
        ratio: clamp(ratio, 0, 1),
        budgetForBuilding,
        tsubo,
        squareMeters,
        householdAnnualIncome,
        maxAnnualDebt,
        availableAnnualForThisLoan,
        availableMonthlyForThisLoan,
        wishMonthlyTotal,
        bonusAnnual,
        bonusMonthly,
        termYearsEffective,
        termMonths,
        monthlyRate,
        maxTermByAge,
    };
}

export type { SimulationInput };
