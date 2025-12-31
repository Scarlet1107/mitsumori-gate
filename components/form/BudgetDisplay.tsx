"use client";

import { useState, useEffect } from "react";
import type { BaseFormData } from "@/lib/form-types";
import { useSimulationConfig } from "@/hooks/useSimulationConfig";
import { formatManWithOku } from "@/lib/format";
import { buildSimulationInputFromForm } from "@/lib/simulation/form-input";
import { calculateSimulation } from "@/lib/simulation/engine";

interface BudgetResult {
    maxLoanAmount: number;
    downPayment: number;
    totalBudget: number;
}

interface BudgetDisplayProps {
    form: BaseFormData;
    onError: (error: string | null) => void;
}

/**
 * 頭金と借入上限から予算を計算・表示するコンポーネント（Web/対面共通）
 */
export function BudgetDisplay({ form, onError }: BudgetDisplayProps) {
    const [budgetResult, setBudgetResult] = useState<BudgetResult | null>(null);
    const { config, loading: configLoading, error: configError } = useSimulationConfig();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function calculateBudget() {
            try {
                setLoading(true);

                if (!config || !form.ownIncome || !form.downPayment) {
                    setBudgetResult(null);
                    setLoading(false);
                    return;
                }

                const input = buildSimulationInputFromForm(form);
                const result = calculateSimulation(input, config);
                const downPayment = Number(form.downPayment) || 0;
                const maxLoan = result.maxLoanAmount || 0;

                setBudgetResult({
                    maxLoanAmount: maxLoan,
                    downPayment: downPayment,
                    totalBudget: maxLoan + downPayment,
                });

                onError(null);
            } catch (error) {
                console.error("Budget calculation error:", error);
                onError("予算計算中にエラーが発生しました");
            } finally {
                setLoading(false);
            }
        }

        calculateBudget();
    }, [
        form,
        form.ownIncome,
        form.downPayment,
        form.age,
        form.spouseAge,
        form.spouseIncome,
        form.ownLoanPayment,
        form.spouseLoanPayment,
        form.hasSpouse,
        config,
        onError,
    ]);

    if (configLoading || loading) {
        return (
            <div className="space-y-4 text-center">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
                <p className="text-lg text-gray-600">予算計算中...</p>
            </div>
        );
    }

    if (configError) {
        return (
            <div className="text-center space-y-4">
                <p className="text-lg text-red-600">設定の取得に失敗しました</p>
            </div>
        );
    }

    if (!budgetResult) {
        return (
            <div className="text-center space-y-4">
                <p className="text-lg text-gray-600">予算を計算できませんでした</p>
                <p className="text-sm text-gray-500">年収と頭金を入力してください</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 text-center">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-700">あなたの上限予算</h3>
                <div className="text-4xl font-bold text-emerald-700">
                    {formatManWithOku(budgetResult.totalBudget)}
                </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                    <span>借入上限額</span>
                    <span className="font-medium">{formatManWithOku(budgetResult.maxLoanAmount)}</span>
                </div>
                <div className="flex justify-between">
                    <span>頭金</span>
                    <span className="font-medium">{formatManWithOku(budgetResult.downPayment)}</span>
                </div>
                <hr className="border-gray-300" />
                <div className="flex justify-between font-semibold text-base">
                    <span>合計予算</span>
                    <span className="text-emerald-700">{formatManWithOku(budgetResult.totalBudget)}</span>
                </div>
            </div>

            <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded">
                ※この予算は最大借入可能額に基づいています。実際の審査結果とは異なる場合があります。
            </div>
        </div>
    );
}
