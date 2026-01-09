/**
 * フォーム共通ロジックのカスタムフック
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getFormSteps, isStepAvailable, validateStep, type FormStep } from "@/lib/form-steps";
import { getProgressKey, getDataKey, getHistoryKey, calculateProgress } from "@/lib/form-types";
import type {
    BaseFormData,
    NavigationDirection,
    ValidationResult
} from "@/lib/form-types";

interface UseFormOptions<TFormData extends BaseFormData> {
    steps: FormStep[];
    initialFormData: TFormData;
    formType: "web" | "inperson";
    onComplete?: (formData: TFormData) => Promise<void>;
    disablePersistence?: boolean;
}
export function useForm<TFormData extends BaseFormData>(
    options: UseFormOptions<TFormData>
) {
    const { steps, initialFormData, formType, onComplete, disablePersistence = false } = options;
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    // 基本状態
    const [form, setForm] = useState<TFormData>(initialFormData);
    const [currentStepId, setCurrentStepId] = useState(steps[0]?.id ?? "");
    const [direction, setDirection] = useState<NavigationDirection>(1);
    const [errors, setErrors] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [isRestored, setIsRestored] = useState(disablePersistence);
    const shouldUseCookies = formType === "inperson";

    const stepMap = useRef(new Map<string, FormStep>());
    useEffect(() => {
        stepMap.current = new Map(steps.map((step) => [step.id, step]));
    }, [steps]);

    // タイマー管理
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const autoProgressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const autoProgressValueRef = useRef<boolean | undefined>(undefined);

    // タイマーのクリーンアップ
    useEffect(() => {
        return () => {
            if (autoProgressTimerRef.current) {
                clearTimeout(autoProgressTimerRef.current);
            }
            if (debounceTimer) clearTimeout(debounceTimer);
        };
    }, [debounceTimer]);

    // 進捗復元
    useEffect(() => {
        if (disablePersistence) {
            setIsRestored(true);
            return;
        }

        try {
            const savedProgress = localStorage.getItem(getProgressKey(formType));
            const savedForm = localStorage.getItem(getDataKey(formType));
            const savedHistory = localStorage.getItem(getHistoryKey(formType));
            const cookieForm = !savedForm && shouldUseCookies
                ? readCookieValue(getDataKey(formType))
                : null;
            const cookieProgress = !savedProgress && shouldUseCookies
                ? readCookieValue(getProgressKey(formType))
                : null;
            const cookieHistory = !savedHistory && shouldUseCookies
                ? readCookieValue(getHistoryKey(formType))
                : null;

            if (savedForm || cookieForm) {
                const parsedForm = JSON.parse(savedForm ?? cookieForm ?? "{}");
                setForm(parsedForm);
            }

            if (savedProgress || cookieProgress) {
                setCurrentStepId(savedProgress ?? cookieProgress ?? "");
            }

            if (savedHistory || cookieHistory) {
                const parsedHistory = JSON.parse(savedHistory ?? cookieHistory ?? "[]");
                if (Array.isArray(parsedHistory)) {
                    setHistory(parsedHistory.filter((entry) => typeof entry === "string"));
                }
            }
        } catch (error) {
            console.warn("Failed to restore form progress:", error);
        } finally {
            setIsRestored(true);
        }
    }, [steps.length, formType, disablePersistence, shouldUseCookies]);

    // 進捗保存
    useEffect(() => {
        if (disablePersistence || !isRestored) return;
        localStorage.setItem(getDataKey(formType), JSON.stringify(form));
        if (shouldUseCookies) {
            writeCookieValue(getDataKey(formType), JSON.stringify(form));
        }
    }, [form, formType, disablePersistence, isRestored, shouldUseCookies]);

    useEffect(() => {
        if (disablePersistence || !isRestored) return;
        localStorage.setItem(getProgressKey(formType), currentStepId);
        if (shouldUseCookies) {
            writeCookieValue(getProgressKey(formType), currentStepId);
        }
    }, [currentStepId, formType, disablePersistence, isRestored, shouldUseCookies]);

    useEffect(() => {
        if (disablePersistence || !isRestored) return;
        localStorage.setItem(getHistoryKey(formType), JSON.stringify(history));
        if (shouldUseCookies) {
            writeCookieValue(getHistoryKey(formType), JSON.stringify(history));
        }
    }, [history, formType, disablePersistence, isRestored, shouldUseCookies]);

    // 現在のステップ情報
    const visibleSteps = getFormSteps(formType, form, steps);
    const activeStep = stepMap.current.get(currentStepId) ?? visibleSteps[0];
    const currentStepIndex = Math.max(
        0,
        visibleSteps.findIndex((step) => step.id === (activeStep?.id ?? ""))
    );
    const progress = calculateProgress(currentStepIndex, Math.max(visibleSteps.length, 1));

    useEffect(() => {
        if (!isRestored) return;
        const currentStep = stepMap.current.get(currentStepId);
        if (!currentStep || !isStepAvailable(formType, form, currentStep)) {
            if (visibleSteps[0]) {
                setCurrentStepId(visibleSteps[0].id);
            }
        }
    }, [currentStepId, form, formType, visibleSteps, isRestored]);

    // 現在のステップが入力可能かどうか
    const canProceed = useCallback(() => {
        if (!isRestored) {
            return activeStep.type === "display";
        }
        // displayステップは常に進行可能
        if (activeStep.type === "display") {
            return true;
        }

        const validationResult = validateStep(activeStep, form);

        // デバッグログ（開発時のみ）
        if (process.env.NODE_ENV === "development") {
            console.log(`Validation for step ${activeStep.id}:`, {
                isValid: validationResult.isValid,
                error: validationResult.error,
                value: activeStep.field ? form[activeStep.field as keyof TFormData] : undefined
            });
        }

        return validationResult.isValid;
    }, [activeStep, form, isRestored]);    // フィールド更新
    const updateField = useCallback(<K extends keyof TFormData>(
        field: K,
        value: TFormData[K]
    ) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrors(null);
    }, []);

    // バリデーション
    const validateCurrentStep = useCallback((): ValidationResult => {
        const result = validateStep(activeStep, form);
        if (!result.isValid && result.error) {
            setErrors(result.error);
        } else {
            setErrors(null);
        }
        return result;
    }, [activeStep, form]);

    // 次へ進む
    const resolveNextStep = useCallback((selectedValue?: boolean) => {
        const field = activeStep.field as keyof TFormData | undefined;
        const answerValue = selectedValue ?? (field ? form[field] : undefined);
        let nextForm = form;

        if (field && typeof selectedValue === "boolean" && form[field] !== selectedValue) {
            nextForm = { ...nextForm, [field]: selectedValue } as TFormData;
        }

        if (activeStep.type === "question" && typeof answerValue === "boolean" && activeStep.onAnswer) {
            const updates = activeStep.onAnswer(nextForm, answerValue);
            nextForm = { ...nextForm, ...updates };
        }

        const availableSteps = steps.filter((step) => isStepAvailable(formType, nextForm, step));
        const currentIndex = availableSteps.findIndex((step) => step.id === activeStep.id);
        const fallbackStep = availableSteps[currentIndex + 1];

        let nextStepId: string | undefined;
        if (activeStep.nextByAnswer && typeof answerValue === "boolean") {
            nextStepId = answerValue
                ? activeStep.nextByAnswer.true
                : activeStep.nextByAnswer.false;
        }

        const targetStep = nextStepId
            ? availableSteps.find((step) => step.id === nextStepId) ?? fallbackStep
            : fallbackStep;

        return { targetStep, nextForm };
    }, [activeStep, form, formType, steps]);

    const handleNext = useCallback((selectedValue?: boolean) => {
        const skipValidation = activeStep.type === "question" && typeof selectedValue === "boolean";
        if (activeStep.type !== "display" && !skipValidation && !validateCurrentStep().isValid) {
            return;
        }

        const { targetStep, nextForm } = resolveNextStep(selectedValue);
        if (!targetStep) {
            return;
        }

        if (nextForm !== form) {
            setForm(nextForm);
        }

        setDirection(1);
        setCurrentStepId(targetStep.id);
        setHistory((prev) => {
            if (prev[prev.length - 1] === activeStep.id) {
                return prev;
            }
            return [...prev, activeStep.id];
        });
    }, [activeStep, form, resolveNextStep, validateCurrentStep]);

    // 前に戻る
    const handlePrevious = useCallback(() => {
        setHistory((prev) => {
            const nextHistory = [...prev];
            let candidateId: string | undefined;
            while (nextHistory.length > 0) {
                const lastId = nextHistory.pop();
                if (!lastId) continue;
                const step = stepMap.current.get(lastId);
                if (step && isStepAvailable(formType, form, step)) {
                    candidateId = lastId;
                    break;
                }
            }

            if (candidateId) {
                setDirection(-1);
                setCurrentStepId(candidateId);
                return nextHistory;
            }

            const fallback = visibleSteps[0];
            if (fallback) {
                setDirection(-1);
                setCurrentStepId(fallback.id);
            }
            return nextHistory;
        });
    }, [form, formType, visibleSteps]);

    // 自動進行（はい/いいえボタン用）
    const handleAutoProgress = useCallback((selectedValue?: boolean) => {
        // 既存タイマーをクリア
        if (autoProgressTimerRef.current) {
            clearTimeout(autoProgressTimerRef.current);
        }

        autoProgressValueRef.current = selectedValue;

        // 新しいタイマーをセット
        const timer = setTimeout(() => {
            handleNext(autoProgressValueRef.current);
            autoProgressValueRef.current = undefined;
            autoProgressTimerRef.current = null;
        }, 300);
        autoProgressTimerRef.current = timer;
    }, [handleNext]);

    // 完了処理
    const handleComplete = useCallback(async () => {
        if (!onComplete) return;

        try {
            setLoading(true);
            await onComplete(form);

            // 保存データをクリア
            localStorage.removeItem(getProgressKey(formType));
            localStorage.removeItem(getDataKey(formType));
            localStorage.removeItem(getHistoryKey(formType));
            if (shouldUseCookies) {
                clearCookieValue(getProgressKey(formType));
                clearCookieValue(getDataKey(formType));
                clearCookieValue(getHistoryKey(formType));
            }

            router.push(`/done?mode=${formType}`);
        } catch (error) {
            console.error("Save failed:", error);
            setErrors("保存中にエラーが発生しました");
        } finally {
            setLoading(false);
        }
    }, [onComplete, form, formType, router, shouldUseCookies]);

    // フォーカス管理
    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputRef.current && shouldAutoFocus(activeStep.type)) {
                inputRef.current.focus();
            }
        }, 300); // アニメーション完了後

        return () => clearTimeout(timer);
    }, [currentStepId, activeStep.type]);

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

    const resetForm = useCallback((overrides: Partial<TFormData> = {}) => {
        const nextForm = { ...initialFormData, ...overrides };
        setForm(nextForm);
        setHistory([]);
        setErrors(null);
        setDirection(1);
        setCurrentStepId(steps[0]?.id ?? "");

        if (!disablePersistence) {
            localStorage.removeItem(getProgressKey(formType));
            localStorage.removeItem(getDataKey(formType));
            localStorage.removeItem(getHistoryKey(formType));
            if (shouldUseCookies) {
                clearCookieValue(getProgressKey(formType));
                clearCookieValue(getDataKey(formType));
                clearCookieValue(getHistoryKey(formType));
            }
        }
    }, [initialFormData, steps, formType, disablePersistence, shouldUseCookies]);

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
        totalSteps: visibleSteps.length,

        // アクション
        updateField,
        handleNext,
        handlePrevious,
        handleAutoProgress,
        handleComplete,
        validateCurrentStep,
        setErrors,
        debounce,
        resetForm,

        // Ref
        inputRef,

        // ユーティリティ
        isLastStep: currentStepIndex === visibleSteps.length - 1,
        isFirstStep: currentStepIndex === 0,
        canProceed: canProceed(),
    };
}

// 自動フォーカスが必要な入力タイプかどうか
function shouldAutoFocus(stepType?: string): boolean {
    return ["text", "email", "number", "tel", "postal_code"].includes(stepType || "");
}

function readCookieValue(key: string): string | null {
    if (typeof document === "undefined") return null;
    const entries = document.cookie.split("; ");
    for (const entry of entries) {
        if (!entry) continue;
        const index = entry.indexOf("=");
        const name = entry.slice(0, index);
        if (name === key) {
            return decodeURIComponent(entry.slice(index + 1));
        }
    }
    return null;
}

function writeCookieValue(key: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 7) {
    if (typeof document === "undefined") return;
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}`;
}

function clearCookieValue(key: string) {
    if (typeof document === "undefined") return;
    document.cookie = `${key}=; path=/; max-age=0`;
}

export type UseFormReturn<TFormData extends BaseFormData> = ReturnType<typeof useForm<TFormData>>;
