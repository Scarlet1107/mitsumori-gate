import { NextRequest, NextResponse } from "next/server";
import { calculateSimulation, type SimulationInput, type SimulationResult } from "@/lib/calculation";
import { getTypedConfigs } from "@/lib/config-store";
import type { SimulationData } from "@/lib/pdf/simulation-pdf";
import { createCustomer, type CustomerCreateInput } from "@/lib/customer-store";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { partialCalculation, sendEmail, formType, ...input }: {
            partialCalculation?: boolean;
            sendEmail?: boolean;
            formType?: string;
        } & SimulationInput = body;

        // 部分計算の場合（予算表示用）
        if (partialCalculation) {
            // 部分計算用のバリデーション（年収と頭金のみ必須）
            if (!input.age || !input.ownIncome || !input.downPayment) {
                return NextResponse.json(
                    { error: "部分計算に必要なフィールドが不足しています（年収、年齢、頭金）" },
                    { status: 400 }
                );
            }

            // 部分計算用のデフォルト値設定
            const partialInput: SimulationInput = {
                ...input,
                wishMonthlyPayment: 10, // 仮の値（使用されない）
                wishPaymentYears: 35,   // 仮の値（使用されない）
            };

            // サーバーサイドで設定を取得
            const config = await getTypedConfigs();

            // 部分シミュレーション実行
            const normalizedPartialInput = normalizeSimulationInput(partialInput as SimulationInputPayload);
            const result = await calculateSimulation(normalizedPartialInput, config);

            // 最大借入額のみ返す
            return NextResponse.json({
                simulation: {
                    maxLoan: result.maxLoanAmount,
                    monthlyPaymentCapacity: result.monthlyPaymentCapacity
                }
            });
        }

        // 通常のフルシミュレーション
        // フルシミュレーション用のバリデーション
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
        const normalizedInput = normalizeSimulationInput(input as SimulationInputPayload);
        const result = await calculateSimulation(normalizedInput, config);

        // Webフォームの送信内容を保存
        let customerId: string | null = null;
        if (!partialCalculation && formType === "web") {
            try {
                customerId = await persistWebFormSubmission(body, result, config);
            } catch (dbError) {
                console.error("Failed to persist web form submission:", dbError);
                return NextResponse.json(
                    { error: "フォームデータの保存に失敗しました" },
                    { status: 500 }
                );
            }
        }

        // メール送信が要求された場合
        if (sendEmail && formType === "web" && normalizedInput.name && normalizedInput.email) {
            try {
                const { sendCustomerEmail } = await import("@/lib/simulation/email");

                // SimulationData形式に変換
                const simulationData: SimulationData = {
                    customerName: normalizedInput.name,
                    email: normalizedInput.email,
                    age: normalizedInput.age,
                    ownIncome: normalizedInput.ownIncome,
                    spouseIncome: normalizedInput.spouseIncome || 0,
                    ownLoanPayment: normalizedInput.ownLoanPayment,
                    spouseLoanPayment: normalizedInput.spouseLoanPayment || 0,
                    downPayment: normalizedInput.downPayment,
                    wishMonthlyPayment: normalizedInput.wishMonthlyPayment,
                    wishPaymentYears: normalizedInput.wishPaymentYears,
                    hasSpouse: normalizedInput.hasSpouse || false,
                    usesBonus: normalizedInput.usesBonus || false,
                    hasLand: normalizedInput.hasLand || false,
                    usesTechnostructure: normalizedInput.usesTechnostructure || false,
                    result: result
                };

                // メール送信（非同期で実行、エラーでも処理は続行）
                sendCustomerEmail(customerId ?? "", "simulation_result", simulationData)
                    .then(emailResult => {
                        if (emailResult.success) {
                            console.log(`Simulation result email sent to ${normalizedInput.email}`);
                        } else {
                            console.error(`Failed to send email: ${emailResult.error}`);
                        }
                    })
                    .catch(error => {
                        console.error("Email sending error:", error);
                    });

            } catch (emailError) {
                console.error("Email preparation error:", emailError);
                // メール送信エラーでもシミュレーション結果は返す
            }
        }

        return NextResponse.json({
            ...result,
            customerId: customerId ?? undefined,
        });

    } catch (error) {
        console.error("Simulation API error:", error);
        return NextResponse.json(
            { error: "シミュレーション計算でエラーが発生しました" },
            { status: 500 }
        );
    }
}

type SimulationInputPayload = SimulationInput & Record<string, unknown>;

async function persistWebFormSubmission(
    formPayload: Record<string, unknown>,
    simulationResult: SimulationResult,
    config: { unitPricePerTsubo: number }
): Promise<string> {
    const name = getRequiredString(formPayload["name"], "name");

    const hasSpouse = getOptionalBoolean(formPayload["hasSpouse"]);

    const customerInput: CustomerCreateInput = {
        name,
        email: getOptionalString(formPayload["email"]),
        phone: getOptionalString(formPayload["phone"]),
        postalCode: getOptionalString(formPayload["postalCode"]),
        address: getOptionalString(formPayload["address"]),
        age: getOptionalInteger(formPayload["age"]),
        hasSpouse,
        ownIncome: getOptionalInteger(formPayload["ownIncome"]),
        spouseIncome: hasSpouse ? getOptionalInteger(formPayload["spouseIncome"]) : undefined,
        ownLoanPayment: getOptionalInteger(formPayload["ownLoanPayment"]),
        spouseLoanPayment: hasSpouse ? getOptionalInteger(formPayload["spouseLoanPayment"]) : undefined,
        downPayment: getOptionalInteger(formPayload["downPayment"]),
        wishMonthlyPayment: getOptionalInteger(formPayload["wishMonthlyPayment"]),
        wishPaymentYears: getOptionalInteger(formPayload["wishPaymentYears"]),
        usesBonus: getOptionalBoolean(formPayload["usesBonus"]),
        hasLand: getOptionalBoolean(formPayload["hasLand"]),
        usesTechnostructure: getOptionalBoolean(formPayload["usesTechnostructure"]),
        inputMode: "web",
        spouseName: getOptionalString(formPayload["spouseName"]),
    };

    const customer = await createCustomer(customerInput);

    await prisma.simulation.create({
        data: {
            customerId: customer.id,
            maxLoanAmount: simulationResult.maxLoanAmount,
            wishLoanAmount: simulationResult.wishLoanAmount,
            totalBudget: simulationResult.totalBudget,
            buildingBudget: simulationResult.buildingBudget,
            estimatedTsubo: simulationResult.estimatedTsubo,
            estimatedSquareMeters: simulationResult.estimatedSquareMeters,
            interestRate: simulationResult.interestRate,
            dtiRatio: simulationResult.dtiRatio,
            unitPricePerTsubo: config.unitPricePerTsubo,
        },
    });

    return customer.id;
}

function getOptionalString(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

function getRequiredString(value: unknown, fieldName: string): string {
    const stringValue = getOptionalString(value);
    if (!stringValue) {
        throw new Error(`${fieldName} is required`);
    }
    return stringValue;
}

function getOptionalInteger(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) {
        return Math.round(value);
    }
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? Math.round(parsed) : undefined;
    }
    return undefined;
}

function getOptionalBoolean(value: unknown): boolean | undefined {
    return typeof value === "boolean" ? value : undefined;
}

function normalizeSimulationInput(input: SimulationInputPayload): SimulationInput {
    return {
        ...input,
        age: toRequiredNumber(input.age, "age"),
        ownIncome: toRequiredNumber(input.ownIncome, "ownIncome"),
        spouseIncome: toOptionalNumber(input.spouseIncome),
        ownLoanPayment: toRequiredNumber(input.ownLoanPayment, "ownLoanPayment"),
        spouseLoanPayment: toOptionalNumber(input.spouseLoanPayment),
        downPayment: toRequiredNumber(input.downPayment, "downPayment"),
        wishMonthlyPayment: toRequiredNumber(input.wishMonthlyPayment, "wishMonthlyPayment"),
        wishPaymentYears: toRequiredNumber(input.wishPaymentYears, "wishPaymentYears"),
    };
}

function toRequiredNumber(value: unknown, fieldName: string): number {
    const parsed = typeof value === "string" ? Number(value) : value;
    if (typeof parsed === "number" && Number.isFinite(parsed)) {
        return parsed;
    }
    throw new Error(`${fieldName} must be a valid number`);
}

function toOptionalNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === "") {
        return undefined;
    }
    const parsed = typeof value === "string" ? Number(value) : value;
    return (typeof parsed === "number" && Number.isFinite(parsed)) ? parsed : undefined;
}
