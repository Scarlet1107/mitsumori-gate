/**
 * InPersonFormStepRenderer - ステップ別レンダリングコンポーネント
 */

import { RefObject } from "react";
import { StandardField, PostalCodeField, DetailAddressField, QuestionButtons } from "@/components/form/FormFields";
import { InPersonFormConfirmation } from "./InPersonFormConfirmation";
import { CustomerSearchField } from "./CustomerSearchField";
import { BudgetDisplay } from "@/components/form/BudgetDisplay";
import { LoanAdjustmentPanel } from "@/components/form/LoanAdjustmentPanel";
import { SimulationResultDisplay } from "@/app/web-form/components/SimulationResultDisplay";
import type { FormStep } from "@/lib/form-steps";
import type { CustomerSearchResult } from "@/lib/form-types";
import type { InPersonFormData } from "@/lib/form-types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface InPersonFormStepRendererProps {
    step: FormStep;
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
    isLoadingRecent: boolean;
    onSearch: (query: string) => void;
    onCustomerSelect: (customer: CustomerSearchResult) => void;
    onDraftNameChange: (name: string) => void;
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
    isLoadingRecent,
    onSearch,
    onCustomerSelect,
    onDraftNameChange,
}: InPersonFormStepRendererProps) {
    // 個人情報同意ステップ
    if (step.id === "consent") {
        return (
            <div className="space-y-4">
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold">{step.title}</h2>
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
                        onCheckedChange={(value) => onFieldUpdate("consentAccepted", Boolean(value))}
                        className="mt-1 size-6"
                    />
                    <span className="space-y-1">
                        <span className="text-base font-semibold text-foreground">同意します</span>
                        <span className="block text-sm text-muted-foreground space-y-2">
                            <p>提案資料・見積内容を外部に公開しないことを確認しました。</p>
                            <p>表示される金額はすべて目安であることを理解しています。</p>
                        </span>
                    </span>
                </Label>
                {errors && (
                    <p className="text-sm text-red-600">{errors}</p>
                )}
            </div>
        );
    }


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
                        onFieldUpdate={(field, value) => onFieldUpdate(field, value as InPersonFormData[typeof field])}
                        onError={onError}
                        ResultDisplay={SimulationResultDisplay}
                        loadingMessage="試算中..."
                        emptyMessage="試算結果を取得できませんでした"
                        errorMessage="設定の取得に失敗しました"
                        showCalculatingState={true}
                    />
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
                isLoadingRecent={isLoadingRecent}
                onSearch={onSearch}
                onCustomerSelect={onCustomerSelect}
                onDraftNameChange={onDraftNameChange}
                placeholder={step.placeholder}
                error={errors}
                inputRef={inputRef}
            />
        );
    }

    // 質問タイプのステップ
    if (step.type === "question") {
        const fieldName = (step.field ?? step.id) as keyof InPersonFormData;
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
    const fieldName = (step.field ?? step.id) as keyof InPersonFormData;

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
                    // 型安全な値の設定
                    onFieldUpdate(fieldName, value as InPersonFormData[typeof fieldName]);
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
