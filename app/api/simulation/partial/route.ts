import { NextResponse } from "next/server";
import { calculateSimulation, type SimulationInput } from "@/lib/calculation";
import { loadConfig, normalizeSimulationInput, type SimulationInputPayload } from "../shared";

export async function POST(request: Request) {
    try {
        const body = await request.json() as SimulationInputPayload;

        // 必要なフィールドが揃っているか簡易チェック
        if (!body.age || !body.ownIncome || !body.downPayment) {
            return NextResponse.json(
                { error: "部分計算に必要なフィールドが不足しています（年収、年齢、頭金）" },
                { status: 400 }
            );
        }

        const config = await loadConfig();
        const normalizedInput: SimulationInput = normalizeSimulationInput({
            ...body,
            // 部分計算では仮の値を与える（使用しない項目）
            wishMonthlyPayment: body.wishMonthlyPayment ?? 10,
            wishPaymentYears: body.wishPaymentYears ?? 35,
        });

        const result = await calculateSimulation(normalizedInput, config);

        return NextResponse.json({
            simulation: {
                maxLoan: result.maxLoanAmount,
                monthlyPaymentCapacity: result.monthlyPaymentCapacity
            }
        });
    } catch (error) {
        console.error("Partial simulation error:", error);
        return NextResponse.json(
            { error: "部分シミュレーション計算でエラーが発生しました" },
            { status: 500 }
        );
    }
}
