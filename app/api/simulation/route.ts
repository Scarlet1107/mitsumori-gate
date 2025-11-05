import { NextRequest, NextResponse } from "next/server";
import { calculateSimulation, SimulationInput } from "@/lib/calculation";
import { getTypedConfigs } from "@/lib/config-store";

export async function POST(request: NextRequest) {
    try {
        const input: SimulationInput = await request.json();

        // バリデーション
        if (!input.age || !input.ownIncome || !input.downPayment ||
            !input.wishMonthlyPayment || !input.wishPaymentYears) {
            return NextResponse.json(
                { error: "必須フィールドが不足しています" },
                { status: 400 }
            );
        }

        // サーバーサイドで設定を取得
        const config = await getTypedConfigs();

        // 設定を渡してシミュレーションを実行
        const result = await calculateSimulation(input, config);
        return NextResponse.json(result);

    } catch (error) {
        console.error("Simulation API error:", error);
        return NextResponse.json(
            { error: "シミュレーション計算でエラーが発生しました" },
            { status: 500 }
        );
    }
}
