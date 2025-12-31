/**
 * WebFormStepRenderer - ステップ別レンダリングコンポーネント
 */

import { RefObject } from "react";
import { StandardField, QuestionButtons } from "@/components/form/FormFields";
import { BudgetDisplay } from "@/components/form/BudgetDisplay";
import { LoanAdjustmentPanel } from "@/components/form/LoanAdjustmentPanel";
import { SimulationResultDisplay } from "./SimulationResultDisplay";
import { WebFormConfirmation } from "./WebFormConfirmation";
import type { FormStep } from "@/lib/form-steps";
import type { WebFormData } from "@/lib/form-types";

interface WebFormStepRendererProps {
    step: FormStep;
    form: WebFormData;
    errors: string | null;
    getFieldValue: (fieldName: keyof WebFormData) => string;
    onFieldUpdate: <K extends keyof WebFormData>(field: K, value: WebFormData[K]) => void;
    onQuestionAnswer: (field: keyof WebFormData, answer: boolean) => void;
    onAutoProgress?: () => void;
    onError: (error: string | null) => void;
    inputRef: RefObject<HTMLInputElement>;
}

/**
 * WebFormの各ステップをレンダリングするコンポーネント
 * 
 * ステップタイプに応じて適切なフィールドやコンポーネントを表示
 */
export function WebFormStepRenderer({
    step,
    form,
    errors,
    getFieldValue,
    onFieldUpdate,
    onQuestionAnswer,
    onAutoProgress,
    onError,
    inputRef,
}: WebFormStepRendererProps) {

    // 表示タイプのステップ
    if (step.type === "display") {
        switch (step.id) {
            case "budget_display":
                return (
                    <BudgetDisplay
                        form={form}
                        onError={onError}
                    />
                );
            case "loan_display":
                return (
                    <LoanAdjustmentPanel
                        form={form}
                        onFieldUpdate={(field, value) => onFieldUpdate(field, value as WebFormData[typeof field])}
                        onError={onError}
                        ResultDisplay={SimulationResultDisplay}
                        loadingMessage="設定読み込み中..."
                        emptyMessage="試算準備中..."
                        errorMessage="設定の取得に失敗しました"
                        useConfigErrorMessage={true}
                    />
                );
            case "complete":
                return (
                    <WebFormConfirmation
                        form={form}
                    />
                );
            default:
                return <div>表示コンテンツが未実装です</div>;
        }
    }

    // 質問タイプのステップ
    if (step.type === "question") {
        const fieldName = (step.field ?? step.id) as keyof WebFormData;
        const currentValue = form[fieldName] as boolean | null;

        return (
            <QuestionButtons
                value={currentValue}
                onChange={(answer) => onQuestionAnswer(fieldName, answer)}
                onAutoProgress={onAutoProgress}
                trueLabel="はい"
                falseLabel="いいえ"
            />
        );
    }

    // 通常の入力フィールド
    const fieldName = (step.field ?? step.id) as keyof WebFormData;

    // フィールドが存在しない場合のハンドリング
    if (!(fieldName in form)) {
        console.warn(`Field ${fieldName} not found in form data`);
        return <div>未対応のフィールドです: {fieldName}</div>;
    }

    // 有効な入力タイプのみを許可
    const validType = ["text", "number", "email", "tel"].includes(step.type || "text")
        ? (step.type as "text" | "number" | "email" | "tel")
        : "text";

    return (
        <div className="space-y-2">
            <StandardField
                ref={inputRef}
                type={validType}
                value={getFieldValue(fieldName)}
                onChange={(value) => {
                    // 数値フィールドの場合は文字列として保存
                    onFieldUpdate(fieldName, value as WebFormData[typeof fieldName]);
                }}
                placeholder={step.placeholder}
                unit={step.unit}
            />
            {errors && (
                <p className="text-sm text-red-600">{errors}</p>
            )}
        </div>
    );
}
