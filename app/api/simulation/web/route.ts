import { NextResponse } from "next/server";
import { calculateFullSimulation, buildSimulationData, persistWebFormSubmission, type SimulationInputPayload } from "../shared";

export async function POST(request: Request) {
    try {
        const body = await request.json() as SimulationInputPayload;

        // 必須チェック
        if (!body.age || !body.ownIncome || !body.downPayment ||
            !body.wishMonthlyPayment || !body.wishPaymentYears) {
            return NextResponse.json(
                { error: "必須フィールドが不足しています" },
                { status: 400 }
            );
        }

        // 計算と正規化
        const { config, normalizedInput, result } = await calculateFullSimulation(body);

        // 保存（Web入力のみ）
        let customerId: string | null = null;
        try {
            customerId = await persistWebFormSubmission(body, result, config);
        } catch (dbError) {
            console.error("Failed to persist web form submission:", dbError);
            return NextResponse.json(
                { error: "フォームデータの保存に失敗しました" },
                { status: 500 }
            );
        }

        // メール送信（名前とメールが揃っている場合のみ）
        if (normalizedInput.name && normalizedInput.email) {
            try {
                const { sendCustomerEmail } = await import("@/lib/simulation/email");
                const simulationData = buildSimulationData(normalizedInput, result);
                const emailResult = await sendCustomerEmail(
                    customerId ?? "",
                    "simulation_result",
                    simulationData
                );

                if (emailResult.success) {
                    console.log(`Simulation result email sent to ${normalizedInput.email}`);
                } else {
                    console.error(`Failed to send email: ${emailResult.error}`);
                }
            } catch (emailError) {
                console.error("Email sending error:", emailError);
            }
        } else {
            console.log("Email skipped (missing name or email)");
        }

        return NextResponse.json({
            ...result,
            customerId: customerId ?? undefined,
        });

    } catch (error) {
        console.error("Web simulation API error:", error);
        return NextResponse.json(
            { error: "シミュレーション計算でエラーが発生しました" },
            { status: 500 }
        );
    }
}
