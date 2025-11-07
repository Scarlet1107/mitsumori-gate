"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import type { InPersonFormData } from "@/lib/form-types";
import { useSimulationConfig } from "@/hooks/useSimulationConfig";
import { calculateClientSimulation } from "@/lib/client-simulation";
import { buildSimulationInput } from "@/app/inperson-form/lib/simulation-input";

interface BudgetResult {
    maxLoanAmount: number;
    downPayment: number;
    totalBudget: number;
}

interface InPersonFormBudgetDisplayProps {
    form: InPersonFormData;
    onError: (error: string | null) => void;
}

export function InPersonFormBudgetDisplay({ form, onError }: InPersonFormBudgetDisplayProps) {
    const [budgetResult, setBudgetResult] = useState<BudgetResult | null>(null);
    const { config, loading: configLoading, error: configError } = useSimulationConfig();
    const [calculating, setCalculating] = useState(true);

    useEffect(() => {
        if (!config) return;

        try {
            setCalculating(true);

            if (!form.ownIncome || !form.downPayment) {
                setBudgetResult(null);
                onError(null);
                return;
            }

            const simulationInput = buildSimulationInput(form);
            const result = calculateClientSimulation(simulationInput, config);
            const downPayment = Number(form.downPayment) || 0;

            setBudgetResult({
                maxLoanAmount: result.maxLoanAmount,
                downPayment,
                totalBudget: result.maxLoanAmount + downPayment,
            });
            onError(null);
        } catch (error) {
            console.error("Budget calculation error:", error);
            onError("予算計算中にエラーが発生しました");
        } finally {
            setCalculating(false);
        }
    }, [config, form, onError]);

    const formatCurrency = (value: number) => `${Math.round(value).toLocaleString()}万円`;

    if (configLoading || calculating) {
        return (
            <Card className="p-6 text-center space-y-4">
                <div className="animate-pulse space-y-2">
                    <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                </div>
                <p className="text-sm text-gray-500">上限予算を計算しています...</p>
            </Card>
        );
    }

    if (configError) {
        return (
            <Card className="p-6 text-center space-y-2">
                <p className="text-red-600">設定の取得に失敗しました。時間をおいて再度お試しください。</p>
            </Card>
        );
    }

    if (!budgetResult) {
        return (
            <Card className="p-6 text-center space-y-2">
                <p className="text-gray-600">上限予算を表示するには年収と頭金を入力してください。</p>
            </Card>
        );
    }

    return (
        <Card className="p-6 space-y-6">
            <div className="space-y-2 text-center">
                <p className="text-sm text-gray-600">あなたの上限予算</p>
                <p className="text-4xl font-bold text-blue-600">{formatCurrency(budgetResult.totalBudget)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs">借入上限額</p>
                    <p className="text-xl font-semibold text-blue-600">{formatCurrency(budgetResult.maxLoanAmount)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs">頭金</p>
                    <p className="text-xl font-semibold text-green-600">{formatCurrency(budgetResult.downPayment)}</p>
                </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
                ※ この予算は概算であり、実際の融資条件とは異なる場合があります。
            </p>
        </Card>
    );
}
