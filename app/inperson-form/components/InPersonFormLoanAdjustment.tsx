"use client";

/**
 * InPersonFormLoanAdjustment - 対面フォーム用スライダー調整付きローンシミュレーション表示コンポーネント
 */

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { InPersonSimulationResultDisplay } from "./InPersonSimulationResultDisplay";
import type { InPersonFormData } from "@/lib/form-types";
import { useSimulationConfig } from "@/hooks/useSimulationConfig";
import { formatManWithOku } from "@/lib/format";
import { calculateSimulation, type SimulationResult } from "@/lib/simulation/engine";
import { buildSimulationInputFromForm } from "@/lib/simulation/form-input";

interface InPersonFormLoanAdjustmentProps {
    form: InPersonFormData;
    onFieldUpdate: <K extends keyof InPersonFormData>(field: K, value: InPersonFormData[K]) => void;
    onError: (error: string | null) => void;
}

export function InPersonFormLoanAdjustment({ form, onFieldUpdate, onError }: InPersonFormLoanAdjustmentProps) {
    const { config, loading: configLoading, error: configError } = useSimulationConfig();
    const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
    const [currentMonthlyPayment, setCurrentMonthlyPayment] = useState(
        parseFloat(form.wishMonthlyPayment) || 10
    );
    const [currentPaymentYears, setCurrentPaymentYears] = useState(
        parseInt(form.wishPaymentYears) || 35
    );
    const [calculating, setCalculating] = useState(true);

    const runSimulation = useCallback(() => {
        if (!config) return;
        try {
            setCalculating(true);
            const input = buildSimulationInputFromForm(form, {
                wishMonthlyPayment: currentMonthlyPayment,
                wishPaymentYears: currentPaymentYears,
            });
            const result = calculateSimulation(input, config);
            setSimulationResult(result);
            onError(null);
        } catch (error) {
            console.error("Simulation error:", error);
            onError("試算結果の取得に失敗しました");
        } finally {
            setCalculating(false);
        }
    }, [config, form, currentMonthlyPayment, currentPaymentYears, onError]);

    useEffect(() => {
        runSimulation();
    }, [runSimulation]);

    const handleSliderChange = useCallback((field: 'monthly' | 'years', value: number) => {
        if (field === 'monthly') {
            setCurrentMonthlyPayment(value);
            onFieldUpdate('wishMonthlyPayment', value.toString());
        } else {
            setCurrentPaymentYears(value);
            onFieldUpdate('wishPaymentYears', value.toString());
        }
    }, [onFieldUpdate]);

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
                <p className="text-red-600">設定の取得に失敗しました</p>
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

    return (
        <div className="space-y-6">
            {/* 調整スライダー */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">返済条件の調整</h3>

                {/* 月額返済額スライダー */}
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700">
                                希望返済月額
                            </label>
                            <span className="text-lg font-bold text-emerald-700">
                                {formatManWithOku(currentMonthlyPayment)}
                            </span>
                        </div>
                        <Slider
                            value={[currentMonthlyPayment]}
                            onValueChange={(values: number[]) => handleSliderChange('monthly', values[0])}
                            max={Math.min(simulationResult.monthlyPaymentCapacity * 1.2, 50)}
                            min={5}
                            step={1}
                            className="w-full"
                            showTooltip={true}
                            tooltipContent={(value) => `${value}万円`}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>5万円</span>
                            <span>上限: {formatManWithOku(simulationResult.monthlyPaymentCapacity)}</span>
                        </div>
                    </div>

                    {/* 返済年数スライダー */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700">
                                希望返済期間
                            </label>
                            <span className="text-lg font-bold text-emerald-600">
                                {currentPaymentYears}年
                            </span>
                        </div>
                        <Slider
                            value={[currentPaymentYears]}
                            onValueChange={(values: number[]) => handleSliderChange('years', values[0])}
                            max={50}
                            min={10}
                            step={1}
                            className="w-full"
                            showTooltip={true}
                            tooltipContent={(value) => `${value}年`}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>10年</span>
                            <span>50年</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* 試算結果 */}
            <InPersonSimulationResultDisplay
                simulationResult={simulationResult}
                loading={configLoading || calculating}
                usesTechnostructure={form.usesTechnostructure}
            />
            {/* 注意事項 */}
            <div className="text-xs text-gray-500 space-y-1">
                <p>※ スライダーで条件を調整すると、リアルタイムで試算結果が更新されます</p>
                <p>※ この試算は概算であり、実際の融資条件とは異なる場合があります</p>
            </div>
        </div>
    );
}
