export interface SimulationConfig {
    screeningInterestRate: number; // %
    repaymentInterestRate: number; // %
    dtiRatio: number; // %
    unitPricePerTsubo: number; // 万円
    technostructureUnitPriceIncrease: number; // 万円
    insulationUnitPriceIncrease: number; // 万円
    demolitionCost: number; // 万円
    defaultLandCost: number; // 万円
    miscCost: number; // 万円
}

export interface SimulationInput {
    age: number;
    spouseAge?: number;
    hasSpouse?: boolean;
    name?: string;
    email?: string;
    ownIncome: number;
    spouseIncome?: number;
    ownLoanPayment: number;
    spouseLoanPayment?: number;
    downPayment: number;
    wishMonthlyPayment: number;
    wishPaymentYears: number;
    usesBonus?: boolean;
    bonusPayment?: number;
    hasLand?: boolean;
    hasExistingBuilding?: boolean;
    hasLandBudget?: boolean;
    landBudget?: number;
    usesTechnostructure?: boolean;
    usesAdditionalInsulation?: boolean;
}

export interface SimulationWarnings {
    exceedsMaxLoan: boolean;
    exceedsMaxTerm: boolean;
}

export interface SimulationResult {
    maxLoanAmount: number;
    wishLoanAmount: number;
    totalBudget: number;
    buildingBudget: number;
    landCost: number;
    demolitionCost: number;
    miscCost: number;
    estimatedTsubo: number;
    estimatedSquareMeters: number;
    monthlyPaymentCapacity: number;
    dtiRatio: number;
    loanRatio: number;
    totalPayment: number;
    totalInterest: number;
    screeningInterestRate: number;
    repaymentInterestRate: number;
    loanTerm: number;
    maxTermYears: number;
    warnings: SimulationWarnings;
}

const SQM_PER_TSUBO = 3.305785;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function calculateLoanAmount(monthlyPayment: number, monthlyRate: number, termMonths: number): number {
    if (monthlyPayment <= 0 || termMonths <= 0) {
        return 0;
    }
    if (monthlyRate === 0) {
        return monthlyPayment * termMonths;
    }
    const powerTerm = Math.pow(1 + monthlyRate, termMonths);
    const numerator = powerTerm - 1;
    const denominator = monthlyRate * powerTerm;
    return monthlyPayment * (numerator / denominator);
}

export function calculateSimulation(input: SimulationInput, config: SimulationConfig): SimulationResult {
    const spouseAge = input.spouseAge ?? input.age;
    const maxAge = Math.max(input.age, spouseAge);
    const maxTermYears = Math.min(50, 80 - maxAge);

    const totalIncome = input.ownIncome + (input.spouseIncome ?? 0);
    const existingMonthlyPayment = input.ownLoanPayment + (input.spouseLoanPayment ?? 0);
    const existingAnnualPayment = existingMonthlyPayment * 12;
    const maxAnnualPayment = totalIncome * (config.dtiRatio / 100);
    const availableAnnualPayment = Math.max(0, maxAnnualPayment - existingAnnualPayment);
    const monthlyPaymentCapacity = availableAnnualPayment / 12;

    const screeningMonthlyRate = config.screeningInterestRate / 100 / 12;
    const maxLoanAmount = calculateLoanAmount(monthlyPaymentCapacity, screeningMonthlyRate, maxTermYears * 12);

    const bonusPayment = input.usesBonus ? (input.bonusPayment ?? 0) : 0;
    const bonusAnnual = bonusPayment * 2;
    const bonusMonthlyEquivalent = bonusAnnual / 12;
    const wishMonthlyTotal = input.wishMonthlyPayment + bonusMonthlyEquivalent;
    const repaymentMonthlyRate = config.repaymentInterestRate / 100 / 12;
    const wishLoanAmount = calculateLoanAmount(wishMonthlyTotal, repaymentMonthlyRate, input.wishPaymentYears * 12);

    const totalBudget = wishLoanAmount + input.downPayment;

    const hasLand = input.hasLand ?? false;
    const demolitionCost = hasLand && input.hasExistingBuilding ? config.demolitionCost : 0;
    let landCost = 0;
    if (!hasLand) {
        if (input.hasLandBudget) {
            landCost = input.landBudget ?? 0;
        } else {
            landCost = config.defaultLandCost;
        }
    }

    const miscCost = config.miscCost;
    const buildingBudget = Math.max(0, totalBudget - landCost - demolitionCost - miscCost);
    const unitPriceAdjustment = (input.usesTechnostructure ? config.technostructureUnitPriceIncrease : 0)
        + (input.usesAdditionalInsulation ? config.insulationUnitPriceIncrease : 0);
    const effectiveUnitPrice = config.unitPricePerTsubo + unitPriceAdjustment;
    const estimatedTsubo = effectiveUnitPrice > 0
        ? buildingBudget / effectiveUnitPrice
        : 0;
    const estimatedSquareMeters = estimatedTsubo * SQM_PER_TSUBO;

    const totalPayment = (input.wishMonthlyPayment * 12 * input.wishPaymentYears) + (bonusAnnual * input.wishPaymentYears);
    const totalInterest = totalPayment - wishLoanAmount;

    const desiredAnnualPayment = (input.wishMonthlyPayment * 12) + bonusAnnual;
    const dtiRatio = totalIncome > 0
        ? ((existingAnnualPayment + desiredAnnualPayment) / totalIncome) * 100
        : 0;

    const loanRatio = maxLoanAmount > 0 ? wishLoanAmount / maxLoanAmount : 0;

    return {
        maxLoanAmount,
        wishLoanAmount,
        totalBudget,
        buildingBudget,
        landCost,
        demolitionCost,
        miscCost,
        estimatedTsubo,
        estimatedSquareMeters,
        monthlyPaymentCapacity,
        dtiRatio: clamp(dtiRatio, 0, 1000),
        loanRatio: clamp(loanRatio, 0, Number.POSITIVE_INFINITY),
        totalPayment,
        totalInterest,
        screeningInterestRate: config.screeningInterestRate,
        repaymentInterestRate: config.repaymentInterestRate,
        loanTerm: input.wishPaymentYears,
        maxTermYears,
        warnings: {
            exceedsMaxLoan: wishLoanAmount > maxLoanAmount,
            exceedsMaxTerm: input.wishPaymentYears > maxTermYears,
        },
    };
}
