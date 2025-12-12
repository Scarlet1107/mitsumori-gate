/**
 * フォーム共通ロジックのカスタムフック
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { validateStep } from "@/lib/form-validation";
import { getProgressKey, getDataKey, calculateProgress } from "@/lib/form-types";
import type {
    BaseFormData,
    NavigationDirection,
    ValidationResult
} from "@/lib/form-types";

interface UseFormOptions<TFormData extends BaseFormData, TStepConfig> {
    steps: TStepConfig[];
    initialFormData: TFormData;
    formType: "web" | "inperson";
    onComplete?: (formData: TFormData) => Promise<void>;
    disablePersistence?: boolean;
}
export function useForm<TFormData extends BaseFormData, TStepConfig extends { id: string; type?: string }>(
    options: UseFormOptions<TFormData, TStepConfig>
) {
    const { steps, initialFormData, formType, onComplete, disablePersistence = false } = options;
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    // 基本状態
    const [form, setForm] = useState<TFormData>(initialFormData);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [direction, setDirection] = useState<NavigationDirection>(1);
    const [errors, setErrors] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // タイマー管理
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const [autoProgressTimer, setAutoProgressTimer] = useState<NodeJS.Timeout | null>(null);

    // タイマーのクリーンアップ
    useEffect(() => {
        return () => {
            if (autoProgressTimer) clearTimeout(autoProgressTimer);
            if (debounceTimer) clearTimeout(debounceTimer);
        };
    }, [autoProgressTimer, debounceTimer]);

    // 進捗復元
    useEffect(() => {
        if (disablePersistence) return;
        try {
            const savedProgress = localStorage.getItem(getProgressKey(formType));
            const savedForm = localStorage.getItem(getDataKey(formType));

            if (savedProgress) {
                const stepIndex = parseInt(savedProgress, 10);
                if (!isNaN(stepIndex) && stepIndex >= 0 && stepIndex < steps.length) {
                    setCurrentStepIndex(stepIndex);
                }
            }

            if (savedForm) {
                const parsedForm = JSON.parse(savedForm);
                setForm(parsedForm);
            }
        } catch (error) {
            console.warn("Failed to restore form progress:", error);
        }
    }, [steps.length, formType]);

    // 進捗保存
    useEffect(() => {
        if (disablePersistence) return;
        localStorage.setItem(getDataKey(formType), JSON.stringify(form));
    }, [form, formType, disablePersistence]);

    useEffect(() => {
        if (disablePersistence) return;
        localStorage.setItem(getProgressKey(formType), currentStepIndex.toString());
    }, [currentStepIndex, formType, disablePersistence]);

    // 現在のステップ情報
    const activeStep = steps[currentStepIndex];
    const progress = calculateProgress(currentStepIndex, steps.length);

    // 現在のステップが入力可能かどうか
    const canProceed = useCallback(() => {
        // displayステップは常に進行可能
        if (activeStep.type === "display") {
            return true;
        }

        // 質問タイプは明示的にチェック
        if (activeStep.type === "question") {
            const questionFieldMap: Record<string, keyof TFormData> = {
                "spouse_question": "hasSpouse" as keyof TFormData,
                "usesBonus": "usesBonus" as keyof TFormData,
                "hasLand": "hasLand" as keyof TFormData,
                "usesTechnostructure": "usesTechnostructure" as keyof TFormData
            };

            const fieldName = questionFieldMap[activeStep.id];
            if (fieldName) {
                const value = form[fieldName] as boolean | null;
                return value !== null; // nullでなければ有効
            }
        }

        // その他のステップはバリデーション結果で判定
        const validationResult = validateStep(activeStep.id, form);

        // デバッグログ（開発時のみ）
        if (process.env.NODE_ENV === 'development') {
            console.log(`Validation for step ${activeStep.id}:`, {
                isValid: validationResult.isValid,
                error: validationResult.error,
                value: form[activeStep.id as keyof TFormData]
            });
        }

        return validationResult.isValid;
    }, [activeStep.id, activeStep.type, form]);    // フィールド更新
    const updateField = useCallback(<K extends keyof TFormData>(
        field: K,
        value: TFormData[K]
    ) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrors(null);
    }, []);

    // バリデーション
    const validateCurrentStep = useCallback((): ValidationResult => {
        const result = validateStep(activeStep.id, form);
        if (!result.isValid && result.error) {
            setErrors(result.error);
        } else {
            setErrors(null);
        }
        return result;
    }, [activeStep.id, form]);

    // 次へ進む
    const handleNext = useCallback(() => {
        // displayステップ以外はバリデーション
        if (activeStep.type !== "display" && !validateCurrentStep().isValid) {
            return;
        }

        // 配偶者関連の条件分岐（共通ロジック）
        if (activeStep.id === "spouse_question" && form.hasSpouse === false) {
            setForm(prev => ({
                ...prev,
                spouseName: "",
                spouseIncome: "0",
                spouseLoanPayment: "0",
            }));
            setDirection(1);
            // ステップ順: 質問 → 配偶者年収 → 配偶者返済額 → 頭金
            setCurrentStepIndex(prev => Math.min(prev + 3, steps.length - 1)); // 配偶者関連ステップのみスキップ
            return;
        }

        // ボーナス払い関連の条件分岐
        if (activeStep.id === "usesBonus" && form.usesBonus === false) {
            setForm(prev => ({
                ...prev,
                bonusPayment: "0",
            }));
            setDirection(1);
            setCurrentStepIndex(prev => Math.min(prev + 2, steps.length - 1)); // bonusPaymentステップをスキップ
            return;
        }

        setDirection(1);
        setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
    }, [activeStep.id, activeStep.type, form.hasSpouse, form.usesBonus, validateCurrentStep, steps.length]);

    // 前に戻る
    const handlePrevious = useCallback(() => {
        // 配偶者関連の条件分岐（戻る時）
        if (activeStep.id === "downPayment" && form.hasSpouse === false) {
            setDirection(-1);
            setCurrentStepIndex(prev => Math.max(prev - 3, 0)); // 配偶者関連ステップ分戻る
            return;
        }

        // ボーナス払い関連の条件分岐（戻る時）
        if (activeStep.id === "hasLand" && form.usesBonus === false) {
            setDirection(-1);
            setCurrentStepIndex(prev => Math.max(prev - 2, 0)); // bonusPaymentステップをスキップして戻る
            return;
        }

        setDirection(-1);
        setCurrentStepIndex(prev => Math.max(prev - 1, 0));
    }, [activeStep.id, form.hasSpouse, form.usesBonus]);

    // 自動進行（はい/いいえボタン用）
    const handleAutoProgress = useCallback((selectedValue?: boolean) => {
        // 既存タイマーをクリア
        if (autoProgressTimer) {
            clearTimeout(autoProgressTimer);
            setAutoProgressTimer(null);
        }

        // 新しいタイマーをセット
        const timer = setTimeout(() => {
            // 配偶者関連の条件分岐（自動進行時も適用）
        if (activeStep.id === "spouse_question") {
            // selectedValueが提供されている場合はそれを使用、そうでなければformの値を使用
            const hasSpouse = selectedValue !== undefined ? selectedValue : form.hasSpouse;

            if (hasSpouse === false) {
                setForm(prev => ({
                    ...prev,
                    spouseName: "",
                    spouseIncome: "0",
                    spouseLoanPayment: "0",
                }));
                setDirection(1);
                setCurrentStepIndex(prev => Math.min(prev + 3, steps.length - 1));
                return;
            }
        }

            // ボーナス払い関連の条件分岐（自動進行時も適用）
            if (activeStep.id === "usesBonus") {
                // selectedValueが提供されている場合はそれを使用、そうでなければformの値を使用
                const usesBonus = selectedValue !== undefined ? selectedValue : form.usesBonus;

                if (usesBonus === false) {
                    setForm(prev => ({
                        ...prev,
                        bonusPayment: "0",
                    }));
                    setDirection(1);
                    setCurrentStepIndex(prev => Math.min(prev + 2, steps.length - 1)); // bonusPaymentステップをスキップ
                    return;
                }
            }

            // 通常の1ステップ進行
            setDirection(1);
            setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
            setAutoProgressTimer(null);
        }, 300);
        setAutoProgressTimer(timer);
    }, [autoProgressTimer, steps.length, activeStep.id, form.hasSpouse, form.usesBonus]);

    // 完了処理
    const handleComplete = useCallback(async () => {
        if (!onComplete) return;

        try {
            setLoading(true);
            await onComplete(form);

            // 保存データをクリア
            localStorage.removeItem(getProgressKey(formType));
            localStorage.removeItem(getDataKey(formType));

            router.push(`/done?mode=${formType}`);
        } catch (error) {
            console.error("Save failed:", error);
            setErrors("保存中にエラーが発生しました");
        } finally {
            setLoading(false);
        }
    }, [onComplete, form, formType, router]);

    // フォーカス管理
    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputRef.current && shouldAutoFocus(activeStep.type)) {
                inputRef.current.focus();
            }
        }, 300); // アニメーション完了後

        return () => clearTimeout(timer);
    }, [currentStepIndex, activeStep.type]);

    // キーボードイベント処理
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // IME変換中のキー入力では進行しない
            if (e.isComposing || e.keyCode === 229) {
                return;
            }

            // Enterキーで次に進む
            if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
                e.preventDefault();
                handleNext();
            }
            // 文字キーでフォーカス
            else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                const activeElement = document.activeElement;
                if (activeElement?.tagName !== "INPUT" && inputRef.current) {
                    inputRef.current.focus();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleNext]);

    // デバウンス処理
    const debounce = useCallback((callback: () => void, delay: number = 300) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(callback, delay);
        setDebounceTimer(timer);
    }, [debounceTimer]);

    return {
        // 状態
        form,
        currentStepIndex,
        direction,
        errors,
        loading,

        // 計算値
        activeStep,
        progress,

        // アクション
        updateField,
        handleNext,
        handlePrevious,
        handleAutoProgress,
        handleComplete,
        validateCurrentStep,
        setErrors,
        debounce,

        // Ref
        inputRef,

        // ユーティリティ
        isLastStep: currentStepIndex === steps.length - 1,
        isFirstStep: currentStepIndex === 0,
        canProceed: canProceed(),
    };
}

// 自動フォーカスが必要な入力タイプかどうか
function shouldAutoFocus(stepType?: string): boolean {
    return ["text", "email", "number", "tel", "search", "detail_address"].includes(stepType || "");
}

export type UseFormReturn<TFormData extends BaseFormData, TStepConfig extends { id: string; type?: string }> = ReturnType<typeof useForm<TFormData, TStepConfig>>;
