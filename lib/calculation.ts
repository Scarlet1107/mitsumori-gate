export interface ConfigData {
    annualInterestRate: number;
    dtiRatio: number;
    unitPricePerTsubo: number;
}

// クライアントサイドで設定データを取得
async function getConfigFromAPI(): Promise<ConfigData> {
    try {
        const response = await fetch("/api/config");
        if (!response.ok) {
            throw new Error("Failed to fetch config");
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to get config from API:", error);
        // フォールバック値
        return {
            annualInterestRate: 1.5,
            dtiRatio: 35,
            unitPricePerTsubo: 70,
        };
    }
}

export interface SimulationInput {
    age: number;
    ownIncome: number;
    spouseIncome?: number;
    ownLoanPayment: number;
    spouseLoanPayment?: number;
    downPayment: number;
    wishMonthlyPayment: number;
    wishPaymentYears: number;
    usesBonus?: boolean;
    hasLand?: boolean;
    usesTechnostructure?: boolean;
}

export interface SimulationResult {
    maxLoanAmount: number;
    wishLoanAmount: number;
    totalBudget: number;
    buildingBudget: number;
    estimatedTsubo: number;
    estimatedSquareMeters: number;
    monthlyPaymentCapacity: number;
    dtiRatio: number;
    loanRatio: number; // wishLoan / maxLoan
}

export async function calculateSimulation(
    input: SimulationInput,
    config?: ConfigData
): Promise<SimulationResult> {
    try {
        console.log("Getting config data...");
        const configData = config || await getConfigFromAPI();
        console.log("Config loaded:", configData);

        // 世帯年収計算
        const totalIncome = input.ownIncome + (input.spouseIncome || 0);

        // 既存借入返済額計算
        const totalExistingPayment = input.ownLoanPayment + (input.spouseLoanPayment || 0);

        // 年間返済可能額（DTI比率から）
        const maxAnnualPayment = totalIncome * (configData.dtiRatio / 100);

        // 住宅ローンに使える年間返済額
        const availableAnnualPayment = Math.max(0, maxAnnualPayment - totalExistingPayment);

        // 月間返済可能額
        const monthlyPaymentCapacity = availableAnnualPayment / 12;

        // 最大借入可能額計算（元利均等返済）
        const monthlyRate = configData.annualInterestRate / 100 / 12;
        const maxTermByAge = Math.min(35, Math.max(0, 80 - input.age));
        const maxTermMonths = maxTermByAge * 12;

        const maxLoanAmount = calculateLoanAmount(
            monthlyPaymentCapacity,
            monthlyRate,
            maxTermMonths
        );

        // 希望借入額計算
        const wishTermMonths = input.wishPaymentYears * 12;
        const wishLoanAmount = calculateLoanAmount(
            input.wishMonthlyPayment,
            monthlyRate,
            wishTermMonths
        );

        // 総予算
        const totalBudget = wishLoanAmount + input.downPayment;

        // 建築予算（土地を除く）
        const buildingBudget = input.hasLand ? totalBudget : totalBudget * 0.7; // 仮定：土地なしの場合は70%が建築費

        // 延床面積計算
        const estimatedTsubo = buildingBudget / configData.unitPricePerTsubo;
        const estimatedSquareMeters = estimatedTsubo * 3.3;

        return {
            maxLoanAmount,
            wishLoanAmount,
            totalBudget,
            buildingBudget,
            estimatedTsubo,
            estimatedSquareMeters,
            monthlyPaymentCapacity,
            dtiRatio: (totalExistingPayment * 12 + input.wishMonthlyPayment * 12) / totalIncome * 100,
            loanRatio: wishLoanAmount / maxLoanAmount,
        };
    } catch (error) {
        console.error("Configuration or calculation error:", error);
        throw new Error(`計算できませんでした: ${error instanceof Error ? error.message : '設定データの取得に失敗しました'}`);
    }
}

// 元利均等返済での借入可能額計算
function calculateLoanAmount(
    monthlyPayment: number,
    monthlyRate: number,
    termMonths: number
): number {
    if (monthlyRate === 0) {
        return monthlyPayment * termMonths;
    }

    const denominator = monthlyRate * Math.pow(1 + monthlyRate, termMonths);
    const numerator = Math.pow(1 + monthlyRate, termMonths) - 1;

    return monthlyPayment * (numerator / denominator);
}
