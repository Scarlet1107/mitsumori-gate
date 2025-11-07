/**
 * ローカル計算用のシミュレーションロジック
 * スライダー操作中のリアルタイム表示用
 */

interface SimulationInput {
    monthlyPayment: number;
    paymentYears: number;
    interestRate?: number;
}

interface LocalSimulationResult {
    wishLoanAmount: number;
    totalPayment: number;
    totalInterest: number;
    monthlyPayment: number;
    paymentYears: number;
}

/**
 * ローカルでの簡易ローン計算
 * スライダー操作中の即座のフィードバック用
 */
export function calculateLocalSimulation(input: SimulationInput): LocalSimulationResult {
    const { monthlyPayment, paymentYears, interestRate = 1.5 } = input;

    // 月利計算
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = paymentYears * 12;

    // 借入金額計算（元利均等返済）
    const wishLoanAmount = monthlyPayment * 10000 *
        ((1 - Math.pow(1 + monthlyRate, -totalMonths)) / monthlyRate);

    // 総返済額
    const totalPayment = monthlyPayment * totalMonths;

    // 利息総額
    const totalInterest = totalPayment - (wishLoanAmount / 10000);

    return {
        wishLoanAmount: wishLoanAmount / 10000, // 万円に変換
        totalPayment,
        totalInterest,
        monthlyPayment,
        paymentYears
    };
}

interface ApiSimulationResult {
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
 * 完全な試算結果とローカル計算結果をマージ
 * API結果をベースに、変更された部分だけローカル計算で更新
 */
export function mergeWithLocalCalculation(
    apiResult: ApiSimulationResult,
    localResult: LocalSimulationResult
): ApiSimulationResult {
    return {
        ...apiResult,
        wishLoanAmount: localResult.wishLoanAmount,
        totalPayment: localResult.totalPayment,
        totalInterest: localResult.totalInterest,
        loanTerm: localResult.paymentYears,
        // 他の値（建築予算、坪数など）はAPI結果を維持
    };
}
