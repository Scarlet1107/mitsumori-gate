"use client";

import { useEffect, useState } from "react";
import type { BaseFormData } from "@/lib/form-types";
import { formatManWithOku } from "@/lib/format";
import { buildSimulationInputFromForm } from "@/lib/simulation/form-input";
import { calculateSimulation } from "@/lib/simulation/engine";
import { useSimulationConfig } from "@/hooks/useSimulationConfig";

interface WishBudgetDisplayProps {
    form: BaseFormData;
    onError: (error: string | null) => void;
}

export function WishBudgetDisplay({ form, onError }: WishBudgetDisplayProps) {
    const { config, loading: configLoading, error: configError } = useSimulationConfig();
    const [wishBudget, setWishBudget] = useState<number | null>(null);
    const [maxBudget, setMaxBudget] = useState<number | null>(null);
    const [wishLoanAmount, setWishLoanAmount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (configLoading) {
            return;
        }
        if (!config) {
            onError("設定の取得に失敗しました");
            setWishBudget(null);
            setLoading(false);
            return;
        }

        const wishMonthlyPayment = Number(form.wishMonthlyPayment);
        const wishPaymentYears = Number(form.wishPaymentYears);

        if (!Number.isFinite(wishMonthlyPayment)
            || !Number.isFinite(wishPaymentYears)
            || wishMonthlyPayment <= 0
            || wishPaymentYears <= 0
        ) {
            setWishBudget(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const input = buildSimulationInputFromForm(form);
            const result = calculateSimulation(input, config);
            setWishBudget(result.totalBudget);
            setWishLoanAmount(result.wishLoanAmount);
            setMaxBudget(result.maxLoanAmount + result.totalBudget - result.wishLoanAmount);
            // maxBudget = maxLoanAmount + downPayment (downPayment = totalBudget - wishLoanAmount)
            onError(null);
        } catch (error) {
            console.error("Wish budget calculation error:", error);
            onError("希望予算の計算中にエラーが発生しました");
            setWishBudget(null);
            setMaxBudget(null);
            setWishLoanAmount(null);
        } finally {
            setLoading(false);
        }
    }, [config, configLoading, form, onError]);

    if (configError && !config) {
        return (
            <div className="text-center py-8">
                <p className="text-sm text-red-600">{configError}</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-4 text-center">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </div>
                <p className="text-lg text-gray-600">計算中...</p>
            </div>
        );
    }

    if (wishBudget === null) {
        return (
            <div className="text-center space-y-2">
                <p className="text-lg text-gray-600">希望予算を表示できませんでした</p>
                <p className="text-sm text-gray-500">希望条件を入力してください</p>
            </div>
        );
    }

    const downPayment = Math.max(0, (wishBudget ?? 0) - (wishLoanAmount ?? 0));
    const wishMonthlyPayment = Number(form.wishMonthlyPayment);
    const wishPaymentYears = Number(form.wishPaymentYears);
    const bonusPayment = form.usesBonus ? Number(form.bonusPayment) || 0 : 0;

    return (
        <div className="space-y-6 text-center">
            <div className="space-y-2">
                <div className="text-4xl font-bold text-emerald-700">
                    {formatManWithOku(wishBudget)}
                </div>
                {maxBudget !== null && (
                    <div className="text-sm text-gray-500">
                        あなたの上限予算: <span className="font-semibold">{formatManWithOku(maxBudget)}</span>
                    </div>
                )}
            </div>

            <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                    <span>希望借入金額</span>
                    <span className="font-medium">
                        {wishLoanAmount !== null ? formatManWithOku(wishLoanAmount) : "-"}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span>自己資金</span>
                    <span className="font-medium">{formatManWithOku(downPayment)}</span>
                </div>
                <hr className="border-gray-300" />
                <div className="flex justify-between font-semibold text-base">
                    <span>希望予算</span>
                    <span className="text-emerald-700">{formatManWithOku(wishBudget)}</span>
                </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                    <span>希望返済月額</span>
                    <span className="font-medium">{formatManWithOku(wishMonthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                    <span>希望返済年数</span>
                    <span className="font-medium">{wishPaymentYears}年</span>
                </div>
                <div className="flex justify-between">
                    <span>ボーナス払い</span>
                    <span className="font-medium">
                        {form.usesBonus ? `あり（${formatManWithOku(bonusPayment)}）` : "なし"}
                    </span>
                </div>
            </div>

            <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded">
                ※入力された条件をもとに希望予算を算出しています。
            </div>
        </div>
    );
}
