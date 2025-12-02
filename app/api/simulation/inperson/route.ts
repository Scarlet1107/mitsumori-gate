import { NextResponse } from "next/server";
import { calculateFullSimulation, type SimulationInputPayload } from "../shared";

export async function POST(request: Request) {
    try {
        const body = await request.json() as SimulationInputPayload;

        if (!body.age || !body.ownIncome || !body.downPayment ||
            !body.wishMonthlyPayment || !body.wishPaymentYears) {
            return NextResponse.json(
                { error: "必須フィールドが不足しています" },
                { status: 400 }
            );
        }

        const { result } = await calculateFullSimulation(body);

        return NextResponse.json(result);
    } catch (error) {
        console.error("InPerson simulation API error:", error);
        return NextResponse.json(
            { error: "シミュレーション計算でエラーが発生しました" },
            { status: 500 }
        );
    }
}
