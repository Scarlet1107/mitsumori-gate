/**
 * InPersonForm - リファクタリング版
 * 対面相談用フォーム
 */

"use client";

import { useCallback, useEffect, useRef } from "react";
import { FormLayout } from "@/components/form/FormLayout";
import { FormStepRenderer } from "@/components/form/FormStepRenderer";
import { useForm } from "@/hooks/useForm";
import { formSteps, getPhaseLabel, initialInPersonFormData } from "@/lib/form-steps";
import type { InPersonFormData } from "@/lib/form-types";
import type { CustomerSearchResult } from "@/lib/form-types";
import { getDataKey, getProgressKey } from "@/lib/form-types";
import { InPersonFormConfirmation } from "./InPersonFormConfirmation";
import { SimulationResultDisplay } from "@/app/web-form/components/SimulationResultDisplay";

/**
 * InPersonFormメインコンポーネント
 * 
 * 対面相談用の住宅ローン試算フォーム
 * 住所入力と試算のフローを提供
 */
interface InPersonFormProps {
    prefillConsent?: boolean;
    initialCustomerId?: string;
    initialAllowNewEntry?: boolean;
    initialDraftName?: string;
}

export default function InPersonForm({
    prefillConsent = false,
    initialCustomerId,
    initialAllowNewEntry = false,
    initialDraftName,
}: InPersonFormProps) {
    // フォーム共通フック
    const {
        form,
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
        resetForm,
    } = useForm({
        steps: formSteps,
        initialFormData: { ...initialInPersonFormData, consentAccepted: prefillConsent },
        formType: "inperson",
        onComplete: handleFormComplete,
    });
    const hasInitializedFromSelection = useRef(false);

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

    const handleCustomerSelected = useCallback((customer: CustomerSearchResult) => {
        // 顧客データをフォームに反映
        updateField("allowNewEntry", false);
        updateField("customerId", customer.id);
        updateField("name", customer.name || "");
        updateField("email", customer.email || "");
        updateField("phone", customer.phone || "");
        updateField("age", toStringValue(customer.age));
        updateField("spouseAge", toStringValue(customer.spouseAge));
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
        const downPaymentValue = toStringValue(customer.downPayment);
        updateField("downPayment", downPaymentValue);
        if (downPaymentValue) {
            updateField("hasDownPayment", Number(downPaymentValue) > 0);
        } else {
            updateField("hasDownPayment", null);
        }
        updateField("wishMonthlyPayment", toStringValue(customer.wishMonthlyPayment));
        updateField("wishPaymentYears", toStringValue(customer.wishPaymentYears));
        updateField("bonusPayment", toStringValue(customer.bonusPayment));

        // 配偶者情報
        const hasSpouse = customer.hasSpouse ?? null;
        updateField("hasSpouse", hasSpouse);
        if (hasSpouse) {
            updateField("spouseName", customer.spouseName || "");
            updateField("spouseAge", toStringValue(customer.spouseAge));
        } else {
            updateField("spouseName", "");
            updateField("spouseAge", "");
            updateField("spouseIncome", "0");
            updateField("spouseLoanPayment", "0");
        }

        // フラグ系
        updateField("usesBonus", typeof customer.usesBonus === "boolean" ? customer.usesBonus : null);
        updateField("hasLand", typeof customer.hasLand === "boolean" ? customer.hasLand : null);
        updateField("hasExistingBuilding", typeof customer.hasExistingBuilding === "boolean" ? customer.hasExistingBuilding : null);
        updateField("hasLandBudget", typeof customer.hasLandBudget === "boolean" ? customer.hasLandBudget : null);
        updateField("landBudget", toStringValue(customer.landBudget));
        updateField("usesTechnostructure", typeof customer.usesTechnostructure === "boolean" ? customer.usesTechnostructure : null);
        updateField("usesAdditionalInsulation", null);

        // 次のステップへ自動進行
        handleAutoProgress();
    }, [handleAutoProgress, updateField]);

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

    useEffect(() => {
        if (hasInitializedFromSelection.current) return;
        if (!initialCustomerId && !initialAllowNewEntry) return;

        const getStoredState = () => {
            if (typeof window === "undefined") return false;
            const dataKey = getDataKey("inperson");
            const progressKey = getProgressKey("inperson");
            const storedForm = localStorage.getItem(dataKey);
            if (storedForm || localStorage.getItem(progressKey)) {
                return storedForm ? JSON.parse(storedForm) as InPersonFormData : true;
            }
            const cookies = document.cookie.split("; ");
            const formCookie = cookies.find((entry) => entry.startsWith(`${dataKey}=`));
            if (formCookie) {
                const encoded = formCookie.slice(dataKey.length + 1);
                try {
                    return JSON.parse(decodeURIComponent(encoded)) as InPersonFormData;
                } catch {
                    return true;
                }
            }
            const hasProgressCookie = cookies.some((entry) => entry.startsWith(`${progressKey}=`));
            return hasProgressCookie;
        };

        const storedState = getStoredState();
        if (storedState) {
            if (typeof storedState === "object") {
                const storedCustomerId = storedState.customerId;
                const storedAllowNew = storedState.allowNewEntry;
                if (initialCustomerId && storedCustomerId === initialCustomerId) {
                    hasInitializedFromSelection.current = true;
                    return;
                }
                if (initialAllowNewEntry && storedAllowNew) {
                    hasInitializedFromSelection.current = true;
                    return;
                }
            } else {
                hasInitializedFromSelection.current = true;
                return;
            }
            hasInitializedFromSelection.current = true;
            return;
        }

        hasInitializedFromSelection.current = true;

        resetForm({
            consentAccepted: prefillConsent,
            allowNewEntry: initialAllowNewEntry,
            name: initialDraftName || "",
        });

        if (initialCustomerId) {
            (async () => {
                try {
                    const response = await fetch(`/api/customers/${initialCustomerId}`);
                    if (!response.ok) {
                        throw new Error("Failed to load customer");
                    }
                    const customer = await response.json() as CustomerSearchResult;
                    handleCustomerSelected(customer);
                } catch (error) {
                    console.error("Failed to prefill customer:", error);
                }
            })();
        }
    }, [
        initialCustomerId,
        initialAllowNewEntry,
        initialDraftName,
        prefillConsent,
        resetForm,
        handleCustomerSelected,
    ]);

    return (
        <FormLayout
            // 進捗情報
            progress={progress}
            stepLabel={getPhaseLabel(activeStep.phase)}

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
            title={activeStep.displayVariant === "phase_intro" ? undefined : activeStep.title}
            description={activeStep.displayVariant === "phase_intro" ? undefined : activeStep.description}
        >
            {/* ステップ固有のコンテンツ */}
            <FormStepRenderer
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
                ResultDisplay={SimulationResultDisplay}
                Confirmation={InPersonFormConfirmation}
                loanPanelConfig={{
                    loadingMessage: "試算中...",
                    emptyMessage: "試算結果を取得できませんでした",
                    errorMessage: "設定の取得に失敗しました",
                    showCalculatingState: true,
                }}
            />
        </FormLayout>
    );
}
