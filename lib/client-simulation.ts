/**
 * Client-side simulation engine - ラグ0のリアルタイム計算
 */

import { SimulationConfig } from '@/hooks/useSimulationConfig';

export interface ClientSimulationInput {
    // 基本情報
    age: number;
    ownIncome: number;
    spouseIncome?: number;
    ownLoanPayment: number;
    spouseLoanPayment?: number;
    downPayment: number;
    wishMonthlyPayment: number;
    wishPaymentYears: number;

    // オプション
    hasSpouse?: boolean;
    usesBonus?: boolean;
    bonusPayment?: number;
    hasLand?: boolean;
    usesTechnostructure?: boolean;
}

export interface ClientSimulationResult {
    maxLoanAmount: number;
    wishLoanAmount: number;
    totalBudget: number;
    buildingBudget: number;
    estimatedTsubo: number;
    estimatedSquareMeters: number;
    monthlyPaymentCapacity: number;
    dtiRatio: number;
    loanRatio: number;
    totalPayment: number;
    totalInterest: number;
    interestRate: number;
    loanTerm: number;
}

/**
 * クライアントサイド試算エンジン
 * 完全にリアルタイムでラグなし計算
 */
export function calculateClientSimulation(
    input: ClientSimulationInput,
    config: SimulationConfig
): ClientSimulationResult {
    // 入力値の正規化
    const age = Math.max(0, Math.min(100, input.age));
    const ownIncome = Math.max(0, input.ownIncome);
    const spouseIncome = Math.max(0, input.spouseIncome || 0);
    const ownLoanPayment = Math.max(0, input.ownLoanPayment);
    const spouseLoanPayment = Math.max(0, input.spouseLoanPayment || 0);
    const downPayment = Math.max(0, input.downPayment);
    const wishMonthlyPayment = Math.max(0.1, input.wishMonthlyPayment);
    const wishPaymentYears = Math.max(1, Math.min(50, input.wishPaymentYears));
    const bonusPayment = input.usesBonus ? Math.max(0, input.bonusPayment || 0) : 0;

    // 世帯年収計算
    const totalIncome = ownIncome + spouseIncome;

    // 既存借入返済額計算
    const totalExistingPayment = ownLoanPayment + spouseLoanPayment;

    // 年間返済可能額（DTI比率から）
    const maxAnnualPayment = totalIncome * (config.dtiRatio / 100);

    // 住宅ローンに使える年間返済額
    const availableAnnualPayment = Math.max(0, maxAnnualPayment - totalExistingPayment);

    // 月間返済可能額
    const monthlyPaymentCapacity = availableAnnualPayment / 12;

    // 年利から月利を計算
    const monthlyRate = config.annualInterestRate / 100 / 12;

    // 最大借入期間（年齢制限考慮）
    const maxTermByAge = Math.min(35, Math.max(0, 80 - age));
    const maxTermMonths = maxTermByAge * 12;

    // 最大借入可能額計算（元利均等返済）
    const maxLoanAmount = calculateLoanAmount(
        monthlyPaymentCapacity,
        monthlyRate,
        maxTermMonths
    );

    // 希望借入額計算
    const wishTermMonths = wishPaymentYears * 12;
    let effectiveMonthlyPayment = wishMonthlyPayment;

    // ボーナス払いがある場合の調整
    if (bonusPayment > 0) {
        // ボーナス払い分を月払いに換算（6ヶ月に1回 = 年2回）
        const bonusAnnualAmount = bonusPayment * 2;
        const bonusMonthlyEquivalent = bonusAnnualAmount / 12;
        effectiveMonthlyPayment = wishMonthlyPayment - bonusMonthlyEquivalent;
    }

    const wishLoanAmount = calculateLoanAmount(
        effectiveMonthlyPayment,
        monthlyRate,
        wishTermMonths
    );

    // 総予算
    const totalBudget = wishLoanAmount + downPayment;

    // 建築予算（土地を除く）
    let buildingBudget: number;
    if (input.hasLand) {
        // 土地を持っている場合は全額が建築費
        buildingBudget = totalBudget;
    } else {
        // 土地を持っていない場合は70%が建築費（30%が土地代）
        buildingBudget = totalBudget * 0.7;
    }

    // テクノストラクチャー工法の場合のコスト調整
    if (input.usesTechnostructure) {
        // テクノストラクチャー工法は通常より10%高い（仮定）
        buildingBudget = buildingBudget / 1.1;
    }

    // 延床面積計算
    const estimatedTsubo = Math.max(0, buildingBudget / config.unitPricePerTsubo);
    const estimatedSquareMeters = estimatedTsubo * 3.3;

    // 総返済額計算
    const totalPayment = (wishMonthlyPayment * 12 * wishPaymentYears) + (bonusPayment * 2 * wishPaymentYears);

    // 利息総額
    const totalInterest = totalPayment - wishLoanAmount;

    // 返済負担率（DTI）計算
    const actualAnnualPayment = (wishMonthlyPayment * 12) + (bonusPayment * 2) + (totalExistingPayment);
    const dtiRatio = (actualAnnualPayment / totalIncome) * 100;

    // ローン比率
    const loanRatio = maxLoanAmount > 0 ? (wishLoanAmount / maxLoanAmount) : 0;

    return {
        maxLoanAmount,
        wishLoanAmount,
        totalBudget,
        buildingBudget,
        estimatedTsubo,
        estimatedSquareMeters,
        monthlyPaymentCapacity,
        dtiRatio,
        loanRatio,
        totalPayment,
        totalInterest,
        interestRate: config.annualInterestRate,
        loanTerm: wishPaymentYears,
    };
}

/**
 * 元利均等返済での借入可能額計算
 */
function calculateLoanAmount(
    monthlyPayment: number,
    monthlyRate: number,
    termMonths: number
): number {
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

/**
 * 入力値の検証
 */
export function validateSimulationInput(input: Partial<ClientSimulationInput>): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (!input.age || input.age < 18 || input.age > 100) {
        errors.push('年齢は18歳以上100歳以下で入力してください');
    }

    if (!input.ownIncome || input.ownIncome <= 0) {
        errors.push('年収を入力してください');
    }

    if (input.ownLoanPayment === undefined || input.ownLoanPayment < 0) {
        errors.push('既存借入返済額を入力してください（0以上）');
    }

    if (input.downPayment === undefined || input.downPayment < 0) {
        errors.push('頭金を入力してください（0以上）');
    }

    if (!input.wishMonthlyPayment || input.wishMonthlyPayment <= 0) {
        errors.push('希望月額返済額を入力してください');
    }

    if (!input.wishPaymentYears || input.wishPaymentYears <= 0 || input.wishPaymentYears > 50) {
        errors.push('返済期間は1年以上50年以下で入力してください');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}
