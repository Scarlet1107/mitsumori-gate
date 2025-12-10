/**
 * InPersonForm - リファクタリング版
 * 対面相談用フォーム（顧客検索機能付き）
 */

"use client";

import { useCallback } from "react";
import { FormLayout } from "@/components/form/FormLayout";
import { useForm } from "@/hooks/useForm";
import { useInPersonFormCustomerSearch } from "./hooks/useInPersonFormCustomerSearch";
import { inPersonFormSteps, initialInPersonFormData } from "@/lib/inperson-form-config";
import { InPersonFormStepRenderer } from "./InPersonFormStepRenderer";
import type { InPersonFormData } from "@/lib/form-types";
import type { CustomerSearchResult } from "@/lib/inperson-form-config";

/**
 * InPersonFormメインコンポーネント
 * 
 * 対面相談用の住宅ローン試算フォーム
 * 顧客検索機能とより詳細な住所入力を含む
 */
interface InPersonFormProps {
    prefillConsent?: boolean;
}

export default function InPersonForm({ prefillConsent = false }: InPersonFormProps) {
    // フォーム共通フック
    const {
        form,
        currentStepIndex,
        direction,
        errors,
        loading,
        activeStep,
        progress,
        updateField,
        handleNext,
        handlePrevious,
        handleAutoProgress,
        handleComplete,
        setErrors,
        inputRef,
        isLastStep,
        isFirstStep,
        canProceed,
    } = useForm({
        steps: inPersonFormSteps,
        initialFormData: { ...initialInPersonFormData, consentAccepted: prefillConsent },
        formType: "inperson",
        onComplete: handleFormComplete,
    });

    // 顧客検索フック
    const {
        searchQuery,
        searchResults,
        searchLoading,
        recentCustomers,
        isSearching,
        isLoadingRecent,
        handleSearch,
        handleCustomerSelect,
        clearSearch,
    } = useInPersonFormCustomerSearch({
        onCustomerSelected: handleCustomerSelected,
    });

    // フォーム送信処理
    const buildCustomerUpdatePayload = (formData: InPersonFormData) => {
        const toNumber = (value: string): number | undefined => {
            const num = Number(value);
            return Number.isFinite(num) ? num : undefined;
        };

        const normalizeBonusPayment = () => {
            const parsed = toNumber(formData.bonusPayment ?? "");
            if (formData.usesBonus === false) {
                return 0;
            }
            return parsed ?? 0;
        };

        return {
            name: formData.name || undefined,
            email: formData.email || undefined,
            phone: formData.phone || undefined,
            postalCode: formData.postalCode || undefined,
            baseAddress: formData.baseAddress || undefined,
            detailAddress: formData.detailAddress || undefined,
            age: toNumber(formData.age),
            hasSpouse: formData.hasSpouse ?? undefined,
            spouseName: formData.hasSpouse ? (formData.spouseName || undefined) : undefined,
            ownIncome: toNumber(formData.ownIncome),
            ownLoanPayment: toNumber(formData.ownLoanPayment),
            spouseIncome: formData.hasSpouse ? toNumber(formData.spouseIncome) : undefined,
            spouseLoanPayment: formData.hasSpouse ? toNumber(formData.spouseLoanPayment) : undefined,
            downPayment: toNumber(formData.downPayment),
            wishMonthlyPayment: toNumber(formData.wishMonthlyPayment),
            wishPaymentYears: toNumber(formData.wishPaymentYears),
            usesBonus: formData.usesBonus ?? undefined,
            bonusPayment: normalizeBonusPayment(),
            hasLand: formData.hasLand ?? undefined,
            usesTechnostructure: formData.usesTechnostructure ?? undefined,
            inPersonCompleted: true,
        };
    };

    async function handleFormComplete(formData: InPersonFormData) {
        try {
            const response = await fetch("/api/simulation/inperson", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    formType: "inperson"
                }),
            });

            if (!response.ok) {
                throw new Error("送信に失敗しました");
            }

            if (formData.customerId) {
                await fetch(`/api/customers/${formData.customerId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(buildCustomerUpdatePayload(formData)),
                });
            }

            // 成功時は完了ページへリダイレクト（useFormが自動処理）
        } catch (error) {
            console.error("Form submission error:", error);
            throw error; // useFormがエラーハンドリング
        }
    }

    // 顧客選択時のデータ反映
    const toStringValue = (value?: string | number | null) => {
        if (value === null || value === undefined) return "";
        return typeof value === "string" ? value : value.toString();
    };

    function handleCustomerSelected(customer: CustomerSearchResult) {
        // 顧客データをフォームに反映
        updateField("customerId", customer.id);
        updateField("name", customer.name || "");
        updateField("email", customer.email || "");
        updateField("phone", customer.phone || "");
        updateField("age", toStringValue(customer.age));
        updateField("postalCode", customer.postalCode || "");
        const combinedAddress = customer.address || "";
        const baseAddress = customer.baseAddress || combinedAddress;
        const detailAddress = customer.baseAddress ? (customer.detailAddress || "") : "";
        updateField("baseAddress", baseAddress);
        updateField("detailAddress", detailAddress);

        // 住所が取得できている場合は結合
        const fullAddress = `${baseAddress}${detailAddress}`.trim() || combinedAddress;
        updateField("address", fullAddress);

        // 数値系
        updateField("ownIncome", toStringValue(customer.ownIncome));
        updateField("ownLoanPayment", toStringValue(customer.ownLoanPayment));
        updateField("spouseIncome", toStringValue(customer.spouseIncome));
        updateField("spouseLoanPayment", toStringValue(customer.spouseLoanPayment));
        updateField("downPayment", toStringValue(customer.downPayment));
        updateField("wishMonthlyPayment", toStringValue(customer.wishMonthlyPayment));
        updateField("wishPaymentYears", toStringValue(customer.wishPaymentYears));
        updateField("bonusPayment", toStringValue(customer.bonusPayment));

        // 配偶者情報
        const hasSpouse = customer.hasSpouse ?? null;
        updateField("hasSpouse", hasSpouse);
        if (hasSpouse) {
            updateField("spouseName", customer.spouseName || "");
        } else {
            updateField("spouseName", "");
            updateField("spouseIncome", "0");
            updateField("spouseLoanPayment", "0");
        }

        // フラグ系
        updateField("usesBonus", typeof customer.usesBonus === "boolean" ? customer.usesBonus : null);
        updateField("hasLand", typeof customer.hasLand === "boolean" ? customer.hasLand : null);
        updateField("usesTechnostructure", typeof customer.usesTechnostructure === "boolean" ? customer.usesTechnostructure : null);

        // 検索をクリア
        clearSearch();

        // 次のステップへ自動進行
        handleAutoProgress();
    }

    // フィールド値の取得
    const getFieldValue = useCallback((fieldName: keyof InPersonFormData): string => {
        const value = form[fieldName];
        if (typeof value === "boolean" || value === null) {
            return value?.toString() || "";
        }
        return value || "";
    }, [form]);

    // フィールド更新のラッパー
    const handleFieldUpdate = useCallback(<K extends keyof InPersonFormData>(
        field: K,
        value: InPersonFormData[K]
    ) => {
        updateField(field, value);
    }, [updateField]);

    // 質問回答の処理
    const handleQuestionAnswer = useCallback((
        field: keyof InPersonFormData,
        answer: boolean
    ) => {
        handleFieldUpdate(field, answer);
        // 自動進行はQuestionButtonsコンポーネント内で処理するため、ここでは呼ばない
    }, [handleFieldUpdate]);

    return (
        <FormLayout
            // 進捗情報
            progress={progress}
            currentStepIndex={currentStepIndex}
            totalSteps={inPersonFormSteps.length}
            formType="inperson"

            // アニメーション
            stepKey={activeStep.id}
            direction={direction}

            // ナビゲーション
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            canProceed={canProceed}
            loading={loading}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onComplete={handleComplete}

            // タイトル・説明
            title={activeStep.title}
            description={activeStep.description}
        >
            {/* ステップ固有のコンテンツ */}
            <InPersonFormStepRenderer
                step={activeStep}
                form={form}
                errors={errors}

                // 基本フィールド操作
                getFieldValue={getFieldValue}
                onFieldUpdate={handleFieldUpdate}
                onQuestionAnswer={handleQuestionAnswer}
                onAutoProgress={handleAutoProgress}
                onError={setErrors}
                inputRef={inputRef as React.RefObject<HTMLInputElement>}

                // 顧客検索機能
                searchQuery={searchQuery}
                searchResults={searchResults}
                searchLoading={searchLoading}
                recentCustomers={recentCustomers}
                isSearching={isSearching}
                isLoadingRecent={isLoadingRecent}
                onSearch={handleSearch}
                onCustomerSelect={handleCustomerSelect}
            />
        </FormLayout>
    );
}
