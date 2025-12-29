"use client";

/**
 * InPersonFormSimulationDisplay - InPersonForm用試算結果表示コンポーネント
 */

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatManWithOku } from "@/lib/format";
import type { InPersonFormData } from "@/lib/form-types";
import { useSimulationConfig } from "@/hooks/useSimulationConfig";
import { calculateSimulation, type SimulationResult } from "@/lib/simulation/engine";
import { buildSimulationInputFromForm } from "@/lib/simulation/form-input";

interface InPersonFormSimulationDisplayProps {
    form: InPersonFormData;
    onError: (error: string | null) => void;
}

/**
 * 対面相談用の住宅ローン試算結果表示コンポーネント
 * WebFormの試算表示をベースに、より詳細な情報を表示
 */
export function InPersonFormSimulationDisplay({ form, onError }: InPersonFormSimulationDisplayProps) {
    const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
    const { config, loading: configLoading, error: configError } = useSimulationConfig();
    const [calculating, setCalculating] = useState(true);

    useEffect(() => {
        if (!config) return;

        try {
            setCalculating(true);
            const input = buildSimulationInputFromForm(form);
            const result = calculateSimulation(input, config);
            setSimulationResult(result);
            onError(null);
        } catch (error) {
            console.error("Simulation error:", error);
            onError("試算結果の取得に失敗しました");
        } finally {
            setCalculating(false);
        }
    }, [config, form, onError]);

    if (configLoading || calculating) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    <p className="mt-2 text-sm text-gray-600">試算中...</p>
                </div>
            </div>
        );
    }

    if (configError) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">設定の取得に失敗しました。時間をおいて再度お試しください。</p>
            </div>
        );
    }

    if (!simulationResult) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">試算結果を取得できませんでした</p>
            </div>
        );
    }

    const formatCurrency = (amount: number) => formatManWithOku(amount);

    const monthlyPaymentDisplay = Number(form.wishMonthlyPayment || 0);
    const showWarning = simulationResult.warnings.exceedsMaxLoan || simulationResult.warnings.exceedsMaxTerm;
    const specLabel = form.usesTechnostructure === null
        ? "未選択"
        : form.usesTechnostructure
            ? "テクノストラクチャー + 長期優良住宅"
            : "長期優良住宅仕様";

    return (
        <div className="space-y-6">
            {/* 顧客情報表示 */}
            {form.customerId && (
                <Card className="p-4 bg-emerald-50 border-emerald-200">
                    <h4 className="text-sm font-semibold text-emerald-800 mb-2">顧客情報</h4>
                    <div className="text-sm space-y-1">
                        <p><span className="font-medium">お名前:</span> {form.name}</p>
                        {form.email && <p><span className="font-medium">メール:</span> {form.email}</p>}
                        {form.phone && <p><span className="font-medium">電話:</span> {form.phone}</p>}
                    </div>
                </Card>
            )}

            {/* 試算結果サマリー */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">住宅ローン試算結果</h3>

                {showWarning && (
                    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        {simulationResult.warnings.exceedsMaxLoan && (
                            <p>※ 上限借入額を超えています。条件の見直しが必要です。</p>
                        )}
                        {simulationResult.warnings.exceedsMaxTerm && (
                            <p>※ 年齢上限を超える返済年数になっています。</p>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">借入金額</p>
                        <p className="text-xl font-bold text-emerald-700">
                            {formatCurrency(simulationResult.wishLoanAmount)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">最大借入可能額</p>
                        <p className="text-xl font-bold text-emerald-700">
                            {formatCurrency(simulationResult.maxLoanAmount)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">月々の返済額</p>
                        <p className="text-xl font-bold text-emerald-600">
                            {formatCurrency(monthlyPaymentDisplay)}
                        </p>
                    </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600">金利</span>
                        <span>{simulationResult.interestRate}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600">返済期間</span>
                        <span>{simulationResult.loanTerm}年</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600">年齢上限（最大）</span>
                        <span>{Math.floor(simulationResult.maxTermYears)}年</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600">総返済額</span>
                        <span>{formatCurrency(simulationResult.totalPayment)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600">利息総額</span>
                        <span>{formatCurrency(simulationResult.totalInterest)}</span>
                    </div>
                </div>
            </Card>

            {/* 対面相談専用の詳細情報 */}
            <Card className="p-6 bg-gray-50">
                <h4 className="text-md font-semibold mb-3">詳細条件</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-600">頭金</p>
                        <p className="font-medium">{formatCurrency(Number(form.downPayment || 0))}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">建築費用</p>
                        <p className="font-medium">{formatCurrency(simulationResult.buildingBudget)}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">土地代</p>
                        <p className="font-medium">{formatCurrency(simulationResult.landCost)}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">解体費用</p>
                        <p className="font-medium">{formatCurrency(simulationResult.demolitionCost)}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">諸経費</p>
                        <p className="font-medium">{formatCurrency(simulationResult.miscCost)}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">年収合計</p>
                        <p className="font-medium">
                            {formatCurrency(Number(form.ownIncome || 0) + Number(form.spouseIncome || 0))}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600">ボーナス払い</p>
                        <p className="font-medium">{form.usesBonus ? "利用する" : "利用しない"}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">土地所有</p>
                        <p className="font-medium">{form.hasLand ? "あり" : "なし"}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">テクノストラクチャー</p>
                        <p className="font-medium">{specLabel}</p>
                    </div>
                </div>
            </Card>

            {/* 注意事項（対面相談向け） */}
            <div className="text-xs text-gray-500 space-y-1">
                <p>※ この試算は概算であり、実際の融資条件とは異なる場合があります</p>
                <p>※ 正式な審査では追加の書類や条件確認が必要です</p>
                <p>※ より詳細なプランについて、引き続きご相談承ります</p>
            </div>
        </div>
    );
}
