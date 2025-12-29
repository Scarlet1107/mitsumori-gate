/**
 * WebFormStepRenderer - ステップ別レンダリングコンポーネント
 */

import { RefObject } from "react";
import { StandardField, QuestionButtons } from "@/components/form/FormFields";
import { WebFormBudgetDisplay } from "./WebFormBudgetDisplay";
import { WebFormLoanAdjustment } from "./WebFormLoanAdjustment";
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
                    <WebFormBudgetDisplay
                        form={form}
                        onError={onError}
                    />
                );
            case "loan_display":
                return (
                    <WebFormLoanAdjustment
                        form={form}
                        onFieldUpdate={onFieldUpdate}
                        onError={onError}
                    />
                );
            case "floor_plan_display":
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">{step.title}</h2>
                        <div className="p-4 bg-emerald-50 rounded-lg">
                            <p className="text-lg">おすすめ間取りプランを表示中...</p>
                        </div>
                    </div>
                );
            case "adjusted_plan_display":
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">{step.title}</h2>
                        <div className="p-4 bg-emerald-50 rounded-lg">
                            <p className="text-lg">調整後のプランを表示中...</p>
                        </div>
                    </div>
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
