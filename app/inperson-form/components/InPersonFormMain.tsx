/**
 * InPersonForm - リファクタリング版
 * 対面相談用フォーム（顧客検索機能付き）
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { FormLayout } from "@/components/form/FormLayout";
import { useForm } from "@/hooks/useForm";
import { useInPersonFormCustomerSearch } from "./hooks/useInPersonFormCustomerSearch";
import { formSteps, initialInPersonFormData } from "@/lib/form-steps";
import { InPersonFormStepRenderer } from "./InPersonFormStepRenderer";
import type { InPersonFormData } from "@/lib/form-types";
import type { CustomerSearchResult } from "@/lib/form-types";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
        totalSteps,
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
        steps: formSteps,
        initialFormData: { ...initialInPersonFormData, consentAccepted: prefillConsent },
        formType: "inperson",
        onComplete: handleFormComplete,
    });
    const [showNewEntryDialog, setShowNewEntryDialog] = useState(false);
    const [advanceAfterNewEntry, setAdvanceAfterNewEntry] = useState(false);

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

    // 検索欄の入力変更時に新規フラグをリセット
    const handleDraftNameChange = (value: string) => {
        handleFieldUpdate("name", value);
        handleFieldUpdate("allowNewEntry", false);
    };

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
            spouseAge: formData.hasSpouse ? toNumber(formData.spouseAge) : undefined,
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
            hasExistingBuilding: formData.hasLand ? formData.hasExistingBuilding ?? undefined : undefined,
            hasLandBudget: formData.hasLand === false ? formData.hasLandBudget ?? undefined : undefined,
            landBudget: formData.hasLand === false ? toNumber(formData.landBudget) : undefined,
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
        updateField("downPayment", toStringValue(customer.downPayment));
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

    // 検索ステップで検索・選択なしに進む場合の確認
    const handleNextAttempt = () => {
        if (activeStep.id === "search_name" && !form.customerId && !form.name.trim()) {
            setShowNewEntryDialog(true);
            return;
        }
        handleNext();
    };

    const proceedAsNewEntry = () => {
        handleFieldUpdate("allowNewEntry", true);
        setShowNewEntryDialog(false);
        setAdvanceAfterNewEntry(true);
    };

    // allowNewEntry をセットした上で次に進む。state更新を待ってから進めるためのフック。
    useEffect(() => {
        if (advanceAfterNewEntry && form.allowNewEntry) {
            setAdvanceAfterNewEntry(false);
            handleNext();
        }
    }, [advanceAfterNewEntry, form.allowNewEntry, handleNext]);

    return (
        <FormLayout
            // 進捗情報
            progress={progress}
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            formType="inperson"

            // アニメーション
            stepKey={activeStep.id}
            direction={direction}

            // ナビゲーション
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            canProceed={activeStep.id === "search_name" ? true : canProceed}
            loading={loading}
            onPrevious={handlePrevious}
            onNext={handleNextAttempt}
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
                onDraftNameChange={handleDraftNameChange}
            />
            {/* 新規受付で進める確認ダイアログ */}
            <AlertDialog open={showNewEntryDialog} onOpenChange={setShowNewEntryDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>新規のお客様として進みますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                            検索結果から顧客を選択せずに進むと、新規受付としてヒアリングを開始します。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowNewEntryDialog(false)}>戻る</AlertDialogCancel>
                        <AlertDialogAction onClick={proceedAsNewEntry}>新規で進める</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </FormLayout>
    );
}
