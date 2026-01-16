export interface SimulationConfig {
    screeningInterestRate: number; // %
    repaymentInterestRate: number; // %
    dtiRatio: number; // %
    unitPriceTiers: Array<{
        maxTsubo: number;
        unitPrice: number;
    }>;
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
    maxLoanAmount: number; // 借入可能額（審査金利ベース）
    wishLoanAmount: number; // 希望借入額（希望返済額ベース）
    totalBudget: number; // 総予算（借入額 + 頭金）
    buildingBudget: number; // 建築に使える予算（総予算から土地・解体・諸費用を引いた額）
    landCost: number; // 土地費用
    demolitionCost: number; // 解体費用（既存建物がある場合のみ）
    miscCost: number; // 諸費用（固定）
    estimatedTsubo: number; // 想定延床面積（坪）
    estimatedSquareMeters: number; // 想定延床面積（平方メートル）
    unitPricePerTsubo: number; // 適用した坪単価（万円）
    monthlyPaymentCapacity: number; // 月々の返済余力
    dtiRatio: number; // 返済比率（DTI）
    loanRatio: number; // 希望借入額 / 借入可能額 の比率
    totalPayment: number; // 総返済額（元利合計、ボーナス含む）
    totalInterest: number; // 総利息（総返済額 - 借入額）
    maxLoanTotalPayment: number; // 最大借入額の総返済額（審査金利・上限年数ベース）
    maxLoanTotalInterest: number; // 最大借入額の総利息（総返済額 - 最大借入額）
    screeningInterestRate: number; // 審査金利（%）
    repaymentInterestRate: number; // 返済金利（%）
    loanTerm: number; // 返済年数（希望）
    maxTermYears: number; // 年齢から算出した上限返済年数
    warnings: SimulationWarnings; // 警告フラグ
}

const SQM_PER_TSUBO = 3.305785;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function selectUnitPriceTier(
    buildingBudget: number,
    tiers: SimulationConfig["unitPriceTiers"]
): { maxTsubo: number; unitPrice: number } {
    if (tiers.length === 0) {
        return { maxTsubo: 0, unitPrice: 0 };
    }
    const sorted = [...tiers].sort((a, b) => a.maxTsubo - b.maxTsubo);
    for (const tier of sorted) {
        const maxBudget = tier.maxTsubo * tier.unitPrice;
        if (buildingBudget <= maxBudget) {
            return tier;
        }
    }
    return sorted[sorted.length - 1];
}

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


// お金の計算を行う関数 シミュレーションに出てくるお金の計算をここでまとめて行う
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
    const selectedTier = selectUnitPriceTier(buildingBudget, config.unitPriceTiers);
    const unitPriceAdjustment = (input.usesTechnostructure ? config.technostructureUnitPriceIncrease : 0)
        + (input.usesAdditionalInsulation ? config.insulationUnitPriceIncrease : 0);
    const effectiveUnitPrice = selectedTier.unitPrice + unitPriceAdjustment;
    const estimatedTsubo = effectiveUnitPrice > 0
        ? buildingBudget / effectiveUnitPrice
        : 0;
    const estimatedSquareMeters = estimatedTsubo * SQM_PER_TSUBO;

    const totalPayment = (input.wishMonthlyPayment * 12 * input.wishPaymentYears) + (bonusAnnual * input.wishPaymentYears);
    const totalInterest = totalPayment - wishLoanAmount;
    const maxLoanTotalPayment = monthlyPaymentCapacity * maxTermYears * 12;
    const maxLoanTotalInterest = maxLoanTotalPayment - maxLoanAmount;

    const desiredAnnualPayment = (input.wishMonthlyPayment * 12) + bonusAnnual;
    const dtiRatio = totalIncome > 0
        ? ((existingAnnualPayment + desiredAnnualPayment) / totalIncome) * 100
        : 0;

    const loanRatio = maxLoanAmount > 0 ? wishLoanAmount / maxLoanAmount : 0;

    const result = {
        maxLoanAmount,
        wishLoanAmount,
        totalBudget,
        buildingBudget,
        landCost,
        demolitionCost,
        miscCost,
        estimatedTsubo,
        estimatedSquareMeters,
        unitPricePerTsubo: selectedTier.unitPrice,
        monthlyPaymentCapacity,
        dtiRatio: clamp(dtiRatio, 0, 1000),
        loanRatio: clamp(loanRatio, 0, Number.POSITIVE_INFINITY),
        totalPayment,
        totalInterest,
        maxLoanTotalPayment,
        maxLoanTotalInterest,
        screeningInterestRate: config.screeningInterestRate,
        repaymentInterestRate: config.repaymentInterestRate,
        loanTerm: input.wishPaymentYears,
        maxTermYears,
        warnings: {
            exceedsMaxLoan: wishLoanAmount > maxLoanAmount,
            exceedsMaxTerm: input.wishPaymentYears > maxTermYears,
        },
    };

    return result;
}
