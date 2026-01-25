/**
 * WebForm - リファクタリング版
 * 共通ライブラリとフックを使用した管理可能なフォームコンポーネント
 */

"use client";

import { useCallback } from "react";
import { FormLayout } from "@/components/form/FormLayout";
import { FormStepRenderer } from "@/components/form/FormStepRenderer";
import { useForm } from "@/hooks/useForm";
import { formSteps, getPhaseLabel, initialWebFormData } from "@/lib/form-steps";
import type { WebFormData } from "@/lib/form-types";
import { SimulationResultDisplay } from "./SimulationResultDisplay";
import { WebFormConfirmation } from "./WebFormConfirmation";

/**
 * WebFormメインコンポーネント
 * 
 * 住宅ローン試算のためのWebフォーム
 * 顧客が自分で入力して試算結果を確認できる
 */
export default function WebForm() {
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
        isTransitioning,
    } = useForm({
        steps: formSteps,
        initialFormData: initialWebFormData,
        formType: "web",
        onComplete: handleFormComplete,
    });

    // フォーム送信処理
    async function handleFormComplete(formData: WebFormData) {
        try {
            const response = await fetch("/api/simulation/web", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    formType: "web",
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

    // フィールド値の取得
    const getFieldValue = useCallback((fieldName: keyof WebFormData): string => {
        const value = form[fieldName];
        if (typeof value === "boolean" || value === null) {
            return value?.toString() || "";
        }
        return value || "";
    }, [form]);

    // フィールド更新のラッパー
    const handleFieldUpdate = useCallback(<K extends keyof WebFormData>(
        field: K,
        value: WebFormData[K]
    ) => {
        updateField(field, value);
    }, [updateField]);

    // 質問回答の処理
    const handleQuestionAnswer = useCallback((
        field: keyof WebFormData,
        answer: boolean
    ) => {
        handleFieldUpdate(field, answer);
        // 自動進行はQuestionButtonsコンポーネント内で処理するため、ここでは呼ばない
    }, [handleFieldUpdate]);

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
            navigationDisabled={isTransitioning}

            // タイトル・説明
            title={activeStep.displayVariant === "phase_intro" ? undefined : activeStep.title}
        description={activeStep.displayVariant === "phase_intro" ? undefined : activeStep.description}
    >
        {/* ステップ固有のコンテンツ */}
        <FormStepRenderer
            step={activeStep}
            form={form}
            errors={errors}
            getFieldValue={getFieldValue}
            onFieldUpdate={handleFieldUpdate}
            onQuestionAnswer={handleQuestionAnswer}
            onAutoProgress={handleAutoProgress}
            onError={setErrors}
            inputRef={inputRef as React.RefObject<HTMLInputElement>}
            ResultDisplay={SimulationResultDisplay}
            Completion={WebFormConfirmation}
            loanPanelConfig={{
                loadingMessage: "設定読み込み中...",
                emptyMessage: "試算準備中...",
                errorMessage: "設定の取得に失敗しました",
                useConfigErrorMessage: true,
            }}
        />
    </FormLayout>
);
}
