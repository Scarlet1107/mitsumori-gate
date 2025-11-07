/**
 * InPersonFormStepRenderer - ステップ別レンダリングコンポーネント
 */

import { RefObject } from "react";
import { StandardField, PostalCodeField, DetailAddressField, QuestionButtons } from "@/components/form/FormFields";
import { InPersonFormSimulationDisplay } from "./InPersonFormSimulationDisplay";
import { InPersonFormConfirmation } from "./InPersonFormConfirmation";
import { CustomerSearchField } from "./CustomerSearchField";
import { InPersonFormBudgetDisplay } from "./InPersonFormBudgetDisplay";
import { InPersonFormLoanAdjustment } from "./InPersonFormLoanAdjustment";
import { InPersonFormFloorPlanDisplay } from "./InPersonFormFloorPlanDisplay";
import type { InPersonFormStep, CustomerSearchResult } from "@/lib/inperson-form-config";
import type { InPersonFormData } from "@/lib/form-types";

interface InPersonFormStepRendererProps {
    step: InPersonFormStep;
    form: InPersonFormData;
    errors: string | null;

    // 基本フィールド操作
    getFieldValue: (fieldName: keyof InPersonFormData) => string;
    onFieldUpdate: <K extends keyof InPersonFormData>(field: K, value: InPersonFormData[K]) => void;
    onQuestionAnswer: (field: keyof InPersonFormData, answer: boolean) => void;
    onAutoProgress?: () => void;
    onError: (error: string | null) => void;
    inputRef: RefObject<HTMLInputElement>;

    // 顧客検索関連
    searchQuery: string;
    searchResults: CustomerSearchResult[];
    searchLoading: boolean;
    recentCustomers: CustomerSearchResult[];
    isSearching: boolean;
    onSearch: (query: string) => void;
    onCustomerSelect: (customer: CustomerSearchResult) => void;
}

/**
 * InPersonFormの各ステップをレンダリングするコンポーネント
 * 
 * WebFormに加えて顧客検索機能と詳細住所入力を提供
 */
export function InPersonFormStepRenderer({
    step,
    form,
    errors,

    // 基本フィールド操作
    getFieldValue,
    onFieldUpdate,
    onQuestionAnswer,
    onAutoProgress,
    onError,
    inputRef,

    // 顧客検索機能
    searchQuery,
    searchResults,
    searchLoading,
    recentCustomers,
    isSearching,
    onSearch,
    onCustomerSelect,
}: InPersonFormStepRendererProps) {

    // 表示タイプのステップ
    if (step.type === "display") {
        switch (step.id) {
            case "budget_display":
                return (
                    <InPersonFormBudgetDisplay
                        form={form}
                        onError={onError}
                    />
                );
            case "loan_display":
                return (
                    <InPersonFormSimulationDisplay
                        form={form}
                        onError={onError}
                    />
                );
            case "floor_plan_display":
                return (
                    <InPersonFormFloorPlanDisplay variant="initial" />
                );
            case "adjustment":
                return (
                    <InPersonFormLoanAdjustment
                        form={form}
                        onFieldUpdate={onFieldUpdate}
                        onError={onError}
                    />
                );
            case "adjusted_plan_display":
                return (
                    <InPersonFormFloorPlanDisplay variant="adjusted" />
                );
            case "confirmation":
                return (
                    <InPersonFormConfirmation
                        form={form}
                    />
                );
            default:
                return <div>表示コンテンツが未実装です</div>;
        }
    }

    // 顧客検索ステップ
    if (step.type === "search" && step.id === "search_name") {
        return (
            <CustomerSearchField
                searchQuery={searchQuery}
                searchResults={searchResults}
                searchLoading={searchLoading}
                recentCustomers={recentCustomers}
                isSearching={isSearching}
                onSearch={onSearch}
                onCustomerSelect={onCustomerSelect}
                placeholder={step.placeholder}
                error={errors}
                inputRef={inputRef}
            />
        );
    }

    // 質問タイプのステップ
    if (step.type === "question") {
        const questionFieldMap: Record<string, keyof InPersonFormData> = {
            "spouse_question": "hasSpouse",
            "usesBonus": "usesBonus",
            "hasLand": "hasLand",
            "usesTechnostructure": "usesTechnostructure"
        };

        const fieldName = questionFieldMap[step.id];
        if (!fieldName) {
            return <div>未対応の質問です</div>;
        }

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

    // 郵便番号フィールド
    if (step.type === "postal_code") {
        return (
            <PostalCodeField
                ref={inputRef}
                value={getFieldValue("postalCode")}
                onChange={(value) => onFieldUpdate("postalCode", value)}
                onAddressFetch={async (postalCode: string) => {
                    // 住所取得処理
                    try {
                        const { getAddressFromPostalCode } = await import("@/lib/postal-address");
                        const addressResult = await getAddressFromPostalCode(postalCode);
                        if (addressResult?.success && addressResult.data?.fullAddress) {
                            // 基本住所を更新
                            onFieldUpdate("baseAddress", addressResult.data.fullAddress);
                            // 統合住所も更新（詳細住所と結合）
                            const detailAddress = form.detailAddress || "";
                            onFieldUpdate("address", `${addressResult.data.fullAddress}${detailAddress}`);
                        }
                    } catch (error) {
                        console.warn("Address fetch failed:", error);
                    }
                }}
                placeholder={step.placeholder}
            />
        );
    }

    // 詳細住所フィールド
    if (step.type === "detail_address") {
        return (
            <div className="space-y-2">
                <DetailAddressField
                    ref={inputRef}
                    value={getFieldValue("detailAddress")}
                    onChange={(value) => {
                        onFieldUpdate("detailAddress", value);
                        // 基本住所と結合して統合住所を更新
                        const baseAddress = form.baseAddress || "";
                        onFieldUpdate("address", `${baseAddress}${value}`);
                    }}
                    baseAddress={form.baseAddress}
                    placeholder={step.placeholder}
                />
                {errors && (
                    <p className="text-sm text-red-600">{errors}</p>
                )}
            </div>
        );
    }

    // 通常の入力フィールド
    const fieldName = step.id as keyof InPersonFormData;

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
                stepId={step.id}
                value={getFieldValue(fieldName)}
                onChange={(value) => {
                    // 型安全な値の設定
                    onFieldUpdate(fieldName, value as InPersonFormData[typeof fieldName]);
                }}
                placeholder={step.placeholder}
            />
            {errors && (
                <p className="text-sm text-red-600">{errors}</p>
            )}
        </div>
    );
}
