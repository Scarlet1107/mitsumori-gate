/**
 * FormStepRenderer - Web/対面共通のステップレンダラー
 */

import Link from "next/link";
import type { JSX } from "react";
import { RefObject } from "react";
import {
    StandardField,
    PostalCodeField,
    QuestionButtons,
} from "@/components/form/FormFields";
import { BudgetDisplay } from "@/components/form/BudgetDisplay";
import { WishBudgetDisplay } from "@/components/form/WishBudgetDisplay";
import { LoanAdjustmentPanel } from "@/components/form/LoanAdjustmentPanel";
import { PhaseIntro } from "@/components/form/PhaseIntro";
import type { FormStep } from "@/lib/form-steps";
import type { BaseFormData } from "@/lib/form-types";
import type { SimulationResult } from "@/lib/simulation/engine";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getPhaseLabel } from "@/lib/form-steps";
import { CONSENT_ITEMS } from "@/lib/consent-copy";

type LoanPanelConfig = {
    loadingMessage: string;
    emptyMessage: string;
    errorMessage: string;
    useConfigErrorMessage?: boolean;
    showCalculatingState?: boolean;
};

type ResultDisplayProps = {
    simulationResult: SimulationResult | null;
    loading?: boolean;
    usesTechnostructure?: boolean | null;
    usesAdditionalInsulation?: boolean | null;
    className?: string;
};

interface FormStepRendererProps<TFormData extends BaseFormData> {
    step: FormStep;
    form: TFormData;
    errors: string | null;

    // 基本フィールド操作
    getFieldValue: (fieldName: keyof TFormData) => string;
    onFieldUpdate: <K extends keyof TFormData>(field: K, value: TFormData[K]) => void;
    onQuestionAnswer: (field: keyof TFormData, answer: boolean) => void;
    onAutoProgress?: () => void;
    onError: (error: string | null) => void;
    inputRef: RefObject<HTMLInputElement>;

    // 表示コンテンツ差し替え
    ResultDisplay: (props: ResultDisplayProps) => JSX.Element;
    Confirmation?: (props: { form: TFormData }) => JSX.Element;
    Completion?: (props: { form: TFormData }) => JSX.Element;
    loanPanelConfig: LoanPanelConfig;
    renderConsent?: (props: {
        form: TFormData;
        errors: string | null;
        onFieldUpdate: FormStepRendererProps<TFormData>["onFieldUpdate"];
    }) => JSX.Element;
}

const TECHNOSTRUCTURE_URL = "https://sanwaidea.co.jp/technostructure/";

function DefaultConsent<TFormData extends BaseFormData>({
    form,
    errors,
    onFieldUpdate,
}: {
    form: TFormData;
    errors: string | null;
    onFieldUpdate: FormStepRendererProps<TFormData>["onFieldUpdate"];
}) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">個人情報の取り扱いについて</h2>
                <p className="text-sm text-muted-foreground">
                    入力いただいた個人情報は社内でのシミュレーションと提案検討のみに利用します。表示される金額は目安であり、審査・金利条件・諸費用により実際と異なる場合があります。
                </p>
            </div>
            <Label
                htmlFor="consentCheckbox"
                className="flex cursor-pointer items-start gap-4 rounded-xl bg-muted/40 px-5 py-4 transition hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <Checkbox
                    id="consentCheckbox"
                    checked={form.consentAccepted}
                    onCheckedChange={(value) => onFieldUpdate("consentAccepted" as keyof TFormData, Boolean(value) as TFormData[keyof TFormData])}
                    className="mt-1 size-6"
                />
                <span className="space-y-1">
                    <span className="text-base font-semibold text-foreground">同意します</span>
                    <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                        {CONSENT_ITEMS.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ol>
                </span>
            </Label>
            {errors && <p className="text-sm text-red-600">{errors}</p>}
        </div>
    );
}

export function FormStepRenderer<TFormData extends BaseFormData>({
    step,
    form,
    errors,
    getFieldValue,
    onFieldUpdate,
    onQuestionAnswer,
    onAutoProgress,
    onError,
    inputRef,
    ResultDisplay,
    Confirmation,
    Completion,
    loanPanelConfig,
    renderConsent,
}: FormStepRendererProps<TFormData>) {
    if (step.type === "display") {
        if (step.displayVariant === "phase_intro") {
            return <PhaseIntro title={step.title} stepLabel={getPhaseLabel(step.phase)} />;
        }
        switch (step.id) {
            case "budget_display":
                return <BudgetDisplay form={form} onError={onError} />;
            case "wish_budget_display":
                return <WishBudgetDisplay form={form} onError={onError} />;
            case "loan_display":
                return (
                    <LoanAdjustmentPanel
                        form={form}
                        onFieldUpdate={(field, value) =>
                            onFieldUpdate(field as keyof TFormData, value as TFormData[keyof TFormData])
                        }
                        onError={onError}
                        ResultDisplay={ResultDisplay}
                        loadingMessage={loanPanelConfig.loadingMessage}
                        emptyMessage={loanPanelConfig.emptyMessage}
                        errorMessage={loanPanelConfig.errorMessage}
                        useConfigErrorMessage={loanPanelConfig.useConfigErrorMessage}
                        showCalculatingState={loanPanelConfig.showCalculatingState}
                    />
                );
            case "confirmation":
                return Confirmation ? <Confirmation form={form} /> : <div>表示コンテンツが未実装です</div>;
            case "complete":
                return Completion ? <Completion form={form} /> : <div>表示コンテンツが未実装です</div>;
            default:
                return <div>表示コンテンツが未実装です</div>;
        }
    }

    if (step.id === "consent") {
        const Consent = renderConsent ?? DefaultConsent;
        return <Consent form={form} errors={errors} onFieldUpdate={onFieldUpdate} />;
    }

    if (step.type === "question") {
        const fieldName = (step.field ?? step.id) as keyof TFormData;
        const currentValue = form[fieldName] as boolean | null;

        return (
            <div className="space-y-4">
                {step.id === "usesTechnostructure" && (
                    <div className="flex justify-center">
                        <Link
                            href={TECHNOSTRUCTURE_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-semibold text-emerald-700 underline-offset-4 hover:underline"
                        >
                            テクノストラクチャーの詳細はこちら
                        </Link>
                    </div>
                )}
                <QuestionButtons
                    value={currentValue}
                    onChange={(answer) => onQuestionAnswer(fieldName, answer)}
                    onAutoProgress={onAutoProgress}
                    trueLabel="はい"
                    falseLabel="いいえ"
                />
            </div>
        );
    }

    if (step.type === "postal_code") {
        return (
            <PostalCodeField
                ref={inputRef}
                value={getFieldValue("postalCode" as keyof TFormData)}
                onChange={(value) => onFieldUpdate("postalCode" as keyof TFormData, value as TFormData[keyof TFormData])}
                onAddressFetch={async (postalCode: string) => {
                    try {
                        const { getAddressFromPostalCode } = await import("@/lib/postal-address");
                        const addressResult = await getAddressFromPostalCode(postalCode);
                        if (addressResult?.success && addressResult.data?.fullAddress) {
                            onFieldUpdate("baseAddress" as keyof TFormData, addressResult.data.fullAddress as TFormData[keyof TFormData]);
                            onFieldUpdate("address" as keyof TFormData, addressResult.data.fullAddress as TFormData[keyof TFormData]);
                        }
                    } catch (error) {
                        console.warn("Address fetch failed:", error);
                    }
                }}
                placeholder={step.placeholder}
            />
        );
    }

    const fieldName = (step.field ?? step.id) as keyof TFormData;
    if (!(fieldName in form)) {
        console.warn(`Field ${String(fieldName)} not found in form data`);
        return <div>未対応のフィールドです: {String(fieldName)}</div>;
    }

    const validType = ["text", "number", "email", "tel"].includes(step.type || "text")
        ? (step.type as "text" | "number" | "email" | "tel")
        : "text";

    return (
        <div className="space-y-2">
            <StandardField
                ref={inputRef}
                type={validType}
                value={getFieldValue(fieldName)}
                onChange={(value) => onFieldUpdate(fieldName, value as TFormData[keyof TFormData])}
                placeholder={step.placeholder}
                unit={step.unit}
            />
            {errors && <p className="text-sm text-red-600">{errors}</p>}
        </div>
    );
}
