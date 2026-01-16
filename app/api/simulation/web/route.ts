import { NextResponse } from "next/server";
import { calculateFullSimulation, buildSimulationData, persistWebFormSubmission, type SimulationInputPayload } from "../shared";

export async function POST(request: Request) {
    try {
        const body = await request.json() as SimulationInputPayload;

        const isValidNumber = (value: unknown, min = 0) => {
            const parsed = typeof value === "string" ? Number(value) : value;
            return typeof parsed === "number" && Number.isFinite(parsed) && parsed > min;
        };
        const isFiniteNumber = (value: unknown) => {
            const parsed = typeof value === "string" ? Number(value) : value;
            return typeof parsed === "number" && Number.isFinite(parsed);
        };

        // 必須チェック（自己資金は空欄可、空欄は0として扱う）
        if (!isValidNumber(body.age) || !isValidNumber(body.ownIncome) ||
            !isValidNumber(body.wishMonthlyPayment) || !isValidNumber(body.wishPaymentYears)) {
            return NextResponse.json(
                { error: "必須フィールドが不足しています" },
                { status: 400 }
            );
        }
        const downPaymentValue = body.downPayment as unknown;
        const isEmptyDownPayment = typeof downPaymentValue === "string" && downPaymentValue.trim() === "";
        if (downPaymentValue !== undefined && !isEmptyDownPayment && !isFiniteNumber(downPaymentValue)) {
            return NextResponse.json(
                { error: "必須フィールドが不足しています" },
                { status: 400 }
            );
        }

        // 計算と正規化
        const { normalizedInput, result } = await calculateFullSimulation(body);

        // 保存（Web入力のみ）
        let customerId: string | null = null;
        try {
            customerId = await persistWebFormSubmission(body, result, result.unitPricePerTsubo);
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
