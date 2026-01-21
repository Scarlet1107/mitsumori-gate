"use client";

import { useMemo, useState } from "react";
import { LoanAdjustmentPanel } from "@/components/form/LoanAdjustmentPanel";
import { SimulationResultDisplay } from "@/app/web-form/components/SimulationResultDisplay";
import type { BaseFormData } from "@/lib/form-types";

const createDebugForm = (): BaseFormData => ({
    name: "Debug User",
    email: "debug@example.com",
    phone: "0000000000",
    age: "35",
    spouseAge: "33",
    postalCode: "1000000",
    address: "Debug City",
    baseAddress: "Debug City",
    detailAddress: "Debug Block",
    ownIncome: "650",
    ownLoanPayment: "0",
    hasSpouse: true,
    spouseName: "Debug Spouse",
    spouseIncome: "250",
    spouseLoanPayment: "0",
    hasDownPayment: true,
    downPayment: "300",
    wishMonthlyPayment: "12",
    wishPaymentYears: "35",
    usesBonus: true,
    bonusPayment: "20",
    hasLand: false,
    hasExistingBuilding: false,
    hasLandBudget: false,
    landBudget: "0",
    usesTechnostructure: false,
    usesAdditionalInsulation: false,
    adjustment: "0",
    consentAccepted: true,
    allowNewEntry: true,
});

export default function LoanSliderDebugPage() {
    const [form, setForm] = useState<BaseFormData>(createDebugForm);
    const [error, setError] = useState<string | null>(null);

    const updateField = (
        field: "wishMonthlyPayment" | "wishPaymentYears" | "usesTechnostructure" | "usesAdditionalInsulation",
        value: string | boolean,
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const summary = useMemo(() => {
        return [
            `年齢: ${form.age} / 配偶者: ${form.spouseAge}`,
            `世帯年収: ${form.ownIncome}+${form.spouseIncome}万円`,
            `頭金: ${form.downPayment}万円 / ボーナス: ${form.bonusPayment}万円`,
        ];
    }, [
        form.age,
        form.spouseAge,
        form.ownIncome,
        form.spouseIncome,
        form.downPayment,
        form.bonusPayment,
    ]);

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                    借入金額スライダー デバッグ
                </h1>
                <p className="text-sm text-gray-600">
                    借入条件の調整と試算結果の連動を確認するための検証ページです。
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {summary.map((item) => (
                        <span key={item} className="rounded-full bg-gray-100 px-3 py-1">
                            {item}
                        </span>
                    ))}
                </div>
                {error && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                        {error}
                    </p>
                )}
            </div>

            <LoanAdjustmentPanel
                form={form}
                onFieldUpdate={updateField}
                onError={setError}
                ResultDisplay={(props) => <SimulationResultDisplay {...props} />}
                loadingMessage="試算中です..."
                emptyMessage="試算結果がまだありません。"
                errorMessage="試算結果の取得に失敗しました。"
                useConfigErrorMessage
                showCalculatingState
            />
        </div>
    );
}
