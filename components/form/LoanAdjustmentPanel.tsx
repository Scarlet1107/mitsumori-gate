"use client";

import { useState, useEffect, useCallback, JSX } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { PlanPreviewCard } from "@/components/PlanPreviewCard";
import { useSimulationConfig } from "@/hooks/useSimulationConfig";
import { formatManWithOku } from "@/lib/format";
import { calculateSimulation, type SimulationResult } from "@/lib/simulation/engine";
import { buildSimulationInputFromForm } from "@/lib/simulation/form-input";
import type { BaseFormData } from "@/lib/form-types";

type ResultDisplayProps = {
    simulationResult: SimulationResult | null;
    loading?: boolean;
    usesTechnostructure?: boolean | null;
    usesAdditionalInsulation?: boolean | null;
    className?: string;
};

interface LoanAdjustmentPanelProps {
    form: BaseFormData;
    onFieldUpdate: (field: "wishMonthlyPayment" | "wishPaymentYears", value: string) => void;
    onError: (error: string | null) => void;
    ResultDisplay: (props: ResultDisplayProps) => JSX.Element;
    loadingMessage: string;
    emptyMessage: string;
    errorMessage: string;
    useConfigErrorMessage?: boolean;
    showCalculatingState?: boolean;
}

export function LoanAdjustmentPanel({
    form,
    onFieldUpdate,
    onError,
    ResultDisplay,
    loadingMessage,
    emptyMessage,
    errorMessage,
    useConfigErrorMessage = false,
    showCalculatingState = false,
}: LoanAdjustmentPanelProps) {
    const { config, loading: configLoading, error: configError } = useSimulationConfig();
    const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
    const [currentMonthlyPayment, setCurrentMonthlyPayment] = useState(
        parseFloat(form.wishMonthlyPayment) || 10
    );
    const [currentPaymentYears, setCurrentPaymentYears] = useState(
        parseInt(form.wishPaymentYears) || 35
    );
    const [calculating, setCalculating] = useState(false);

    const runSimulation = useCallback(() => {
        if (!config) return;

        try {
            if (showCalculatingState) setCalculating(true);
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
            if (showCalculatingState) setCalculating(false);
        }
    }, [config, form, currentMonthlyPayment, currentPaymentYears, onError, showCalculatingState]);

    useEffect(() => {
        if (config && !configLoading) {
            runSimulation();
        }
    }, [config, configLoading, runSimulation]);

    const handleSliderChange = useCallback((field: "monthly" | "years", value: number) => {
        if (field === "monthly") {
            setCurrentMonthlyPayment(value);
            onFieldUpdate("wishMonthlyPayment", value.toString());
        } else {
            setCurrentPaymentYears(value);
            onFieldUpdate("wishPaymentYears", value.toString());
        }
    }, [onFieldUpdate]);

    if (configLoading || (showCalculatingState && calculating)) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    <p className="mt-2 text-sm text-gray-600">{loadingMessage}</p>
                </div>
            </div>
        );
    }

    if (configError) {
        const resolvedError = useConfigErrorMessage ? (configError || errorMessage) : errorMessage;
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{resolvedError}</p>
            </div>
        );
    }

    if (!config || !simulationResult) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch">
                <Card className="order-2 h-full p-6 md:col-span-2 md:order-1">
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-gray-700">
                                    希望返済月額
                                </label>
                                <span className="text-lg font-bold text-emerald-600">
                                    {formatManWithOku(currentMonthlyPayment)}
                                </span>
                            </div>
                            <Slider
                                value={[currentMonthlyPayment]}
                                onValueChange={(values: number[]) => handleSliderChange("monthly", values[0])}
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
                                onValueChange={(values: number[]) => handleSliderChange("years", values[0])}
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
                <ResultDisplay
                    simulationResult={simulationResult}
                    loading={configLoading || calculating}
                    usesTechnostructure={form.usesTechnostructure}
                    usesAdditionalInsulation={form.usesAdditionalInsulation}
                    className="order-1 h-full md:order-3"
                />
                <PlanPreviewCard
                    buildingBudget={simulationResult.buildingBudget}
                    estimatedTsubo={simulationResult.estimatedTsubo}
                    className="order-4 h-full md:order-4"
                />
            </div>

            <div className="text-xs text-gray-500 space-y-1">
                <p>※ スライダーで条件を調整すると、リアルタイムで試算結果が更新されます</p>
                <p>※ この試算は概算であり、実際の融資条件とは異なる場合があります</p>
            </div>
        </div>
    );
}
