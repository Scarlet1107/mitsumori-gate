"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import type { KeyboardEvent } from "react";
import {
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
    calculateSimulation,
    createSimulationConfig,
    simulationInputSchema,
} from "@/lib/simulation";
import type { SimulationInput } from "@/lib/simulation";
import type { SimulationResult } from "@/lib/simulation/calculator";
import { formatNumber, formatYen } from "@/lib/format";

const stepVariants = {
    enter: (direction: 1 | -1) => ({
        x: direction > 0 ? 80 : -80,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: 1 | -1) => ({
        x: direction > 0 ? -80 : 80,
        opacity: 0,
    }),
};

const unitNote =
    "※ 金額入力はすべて「万円」単位です（1を入力すると1万円として扱います）。";
const cautionText =
    "表示金額はすべて目安です。審査、金利条件、諸費用により実際と異なる場合があります。";
const bonusNote =
    "ボーナス返済は借入可能上限額の計算には含めていません（安定しない収入扱いとして除外しています）。";

type StepId =
    | "age"
    | "postal_code"
    | "income_husband"
    | "income_wife"
    | "other_loan"
    | "head_money"
    | "has_land"
    | "max_loan"
    | "wish_monthly"
    | "term_years"
    | "bonus_toggle"
    | "bonus_amount"
    | "adjust"
    | "complete";

interface StepConfig {
    id: StepId;
    title: string;
    description?: string;
    placeholder?: string;
    required?: boolean;
    inputType?: "text" | "number";
    inputMode?:
    | "text"
    | "tel"
    | "email"
    | "numeric"
    | "decimal"
    | "search"
    | "url";
}

const steps: StepConfig[] = [
    {
        id: "age",
        title: "年齢を教えてください",
        description: "完済時年齢の目安を計算するために使用します。",
        placeholder: "例）35",
        required: true,
        inputType: "number",
        inputMode: "numeric",
    },
    {
        id: "postal_code",
        title: "郵便番号を入力してください",
        placeholder: "例）123-4567",
        required: true,
    },
    {
        id: "income_husband",
        title: "年収（夫）を教えてください",
        description: unitNote,
        placeholder: "例）600",
        required: true,
        inputType: "number",
        inputMode: "numeric",
    },
    {
        id: "income_wife",
        title: "年収（妻）を教えてください",
        description: unitNote,
        required: true,
        placeholder: "例）400",
        inputType: "number",
        inputMode: "numeric",
    },
    {
        id: "other_loan",
        title: "他の借入の年間返済額を入力してください",
        description: unitNote,
        placeholder: "例）12",
        required: true,
        inputType: "number",
        inputMode: "numeric",
    },
    {
        id: "head_money",
        title: "自己資金（頭金）を入力してください",
        description: unitNote,
        placeholder: "例）500",
        required: true,
        inputType: "number",
        inputMode: "numeric",
    },
    {
        id: "has_land",
        title: "土地はお持ちですか？",
        description: "今回は参考情報として保存します。建築費との按分は今後の拡張で対応予定です。",
    },
    {
        id: "wish_monthly",
        title: "希望する毎月の返済額を入力してください",
        description: unitNote,
        placeholder: "例）15",
        required: true,
        inputType: "number",
        inputMode: "numeric",
    },
    {
        id: "term_years",
        title: "希望する返済期間（年）を入力してください",
        description: "年齢から算出した上限内で入力してください。",
        placeholder: "例）35",
        required: true,
        inputType: "number",
        inputMode: "numeric",
    },
    {
        id: "bonus_toggle",
        title: "ボーナス返済は利用しますか？",
        description: "利用する場合は年2回の返済額を次のステップで入力します。",
    },
    {
        id: "bonus_amount",
        title: "ボーナス1回あたりの返済額を入力してください",
        description: unitNote,
        placeholder: "例）30",
        required: true,
        inputType: "number",
        inputMode: "numeric",
    },
    {
        id: "max_loan",
        title: "借り入れ可能上限額を確認しましょう",
        description:
            "年収と年齢から算出した借入可能額です。ボーナス返済は含めていません。",
    },
    {
        id: "adjust",
        title: "条件を微調整しましょう",
        description: "スライダーを動かして借入希望額と延床目安を確認できます。",
    },
    {
        id: "complete",
        title: "保存が完了しました",
        description: "メール送信は後日実装予定です。",
    },
];

const TOTAL_STEPS = steps.length + 1;

interface FormState {
    age: string;
    postalCode: string;
    incomeHusband: string;
    incomeWife: string;
    otherLoanAnnualRepay: string;
    headMoney: string;
    hasLand: boolean | null;
    wishMonthly: string;
    termYearsSelected: string;
    bonusEnabled: boolean;
    bonusPerPayment: string;
}

interface ToastState {
    message: string;
    type: "success" | "error";
}

interface SaveSummary {
    id: string;
    createdAt: string;
    maxLoan: number;
    wishLoan: number;
}

function parseIntegerField(value: string): number | undefined {
    if (typeof value !== "string") {
        return undefined;
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
        return undefined;
    }
    const normalized = trimmed.replace(/,/gu, "");
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) {
        return undefined;
    }
    return parsed;
}

function buildSchemaPayload(state: FormState): Record<string, unknown> {
    const toYen = (value: number | undefined) =>
        value == null ? undefined : value * 10_000;

    return {
        age: parseIntegerField(state.age),
        postalCode: state.postalCode,
        incomeHusband: toYen(parseIntegerField(state.incomeHusband)),
        incomeWife: toYen(parseIntegerField(state.incomeWife)),
        otherLoanAnnualRepay: toYen(
            parseIntegerField(state.otherLoanAnnualRepay)
        ),
        headMoney: toYen(parseIntegerField(state.headMoney)),
        hasLand: state.hasLand ?? false,
        wishMonthly: toYen(parseIntegerField(state.wishMonthly)),
        termYearsSelected: parseIntegerField(state.termYearsSelected),
        bonusEnabled: state.bonusEnabled,
        bonusPerPayment: state.bonusEnabled
            ? toYen(parseIntegerField(state.bonusPerPayment))
            : 0,
    };
}

function IntakePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [direction, setDirection] = useState<1 | -1>(1);
    const [form, setForm] = useState<FormState>({
        age: "",
        postalCode: "",
        incomeHusband: "",
        incomeWife: "",
        otherLoanAnnualRepay: "",
        headMoney: "",
        hasLand: null,
        wishMonthly: "15",
        termYearsSelected: "35",
        bonusEnabled: false,
        bonusPerPayment: "30",
    });
    const [errors, setErrors] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<ToastState | null>(null);
    const [saveSummary, setSaveSummary] = useState<SaveSummary | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const consent = searchParams.get("consent");
    useEffect(() => {
        if (consent !== "true") {
            router.replace("/consent");
        }
    }, [consent, router]);

    const config = useMemo(() => createSimulationConfig(), []);
    const schemaPayload = useMemo(
        () => buildSchemaPayload(form),
        [form]
    );

    const { input, result } = useMemo<{
        input: SimulationInput | null;
        result: SimulationResult | null;
    }>(() => {
        const parsed = simulationInputSchema.safeParse(schemaPayload);
        if (!parsed.success) {
            return { input: null, result: null };
        }
        const calc = calculateSimulation(parsed.data, config);
        return { input: parsed.data, result: calc };
    }, [schemaPayload, config]);

    const activeStep = steps[currentStepIndex];
    const currentStepNumber = currentStepIndex + 2;
    const progress = (currentStepNumber / TOTAL_STEPS) * 100;

    const ageValue = parseIntegerField(form.age);
    const maxTermByAge = useMemo(() => {
        if (ageValue == null) {
            return config.maxTermYearsCap;
        }
        return Math.min(config.maxTermYearsCap, Math.max(0, 80 - ageValue));
    }, [ageValue, config.maxTermYearsCap]);

    useEffect(() => {
        const term = parseIntegerField(form.termYearsSelected);
        if (term != null && term > maxTermByAge) {
            setForm((prev) => ({
                ...prev,
                termYearsSelected: String(maxTermByAge),
            }));
        }
    }, [form.termYearsSelected, maxTermByAge]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
        return;
    }, [toast]);

    const setInputNode = useCallback(
        (node: HTMLInputElement | null) => {
            inputRef.current = node;
            if (!node) {
                return;
            }

            requestAnimationFrame(() => {
                const current = inputRef.current;
                if (!current || current !== node) return;
                current.focus({ preventScroll: true });
                if (typeof current.select === "function") {
                    current.select();
                }
            });
        },
        []
    );

    const updateField = useCallback(
        <K extends keyof FormState>(field: K, value: FormState[K]) => {
            setForm((prev) => ({
                ...prev,
                [field]: value,
            }));
            setErrors(null);
        },
        []
    );

    const validateStep = useCallback((): boolean => {
        switch (activeStep.id) {
            case "age": {
                const age = parseIntegerField(form.age);
                if (age == null || !Number.isInteger(age) || age < 20 || age > 75) {
                    setErrors("年齢は20〜75歳の整数で入力してください。");
                    return false;
                }
                break;
            }
            case "postal_code": {
                if (!/^\d{3}-?\d{4}$/u.test(form.postalCode.trim())) {
                    setErrors("郵便番号は7桁で入力してください（ハイフン任意）。");
                    return false;
                }
                break;
            }
            case "income_husband":
            case "income_wife":
            case "other_loan":
            case "head_money": {
                const value = parseIntegerField(
                    form[
                    activeStep.id === "income_husband"
                        ? "incomeHusband"
                        : activeStep.id === "income_wife"
                            ? "incomeWife"
                            : activeStep.id === "other_loan"
                                ? "otherLoanAnnualRepay"
                                : "headMoney"
                    ]
                );
                if (value == null || value < 0) {
                    setErrors("0以上の整数で入力してください。");
                    return false;
                }
                break;
            }
            case "has_land": {
                if (form.hasLand == null) {
                    setErrors("土地の有無を選択してください。");
                    return false;
                }
                break;
            }
            case "wish_monthly": {
                const wish = parseIntegerField(form.wishMonthly);
                if (wish == null || wish < 0) {
                    setErrors("希望月返済額は0以上の整数で入力してください。");
                    return false;
                }
                break;
            }
            case "term_years": {
                const term = parseIntegerField(form.termYearsSelected);
                if (term == null || term < 1) {
                    setErrors("返済期間は1年以上の整数で入力してください。");
                    return false;
                }
                if (term > maxTermByAge) {
                    setErrors(`返済期間は最大 ${maxTermByAge} 年以内で入力してください。`);
                    return false;
                }
                break;
            }
            case "bonus_toggle":
                // no validation
                break;
            case "bonus_amount": {
                if (!form.bonusEnabled) {
                    return true;
                }
                const bonus = parseIntegerField(form.bonusPerPayment);
                if (bonus == null || bonus < 0) {
                    setErrors("ボーナス返済額は0以上の整数で入力してください。");
                    return false;
                }
                break;
            }
            case "max_loan":
            case "adjust":
            case "complete":
                break;
            default:
                break;
        }

        setErrors(null);
        return true;
    }, [activeStep.id, form, maxTermByAge]);

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        void handleNext();
    };

    const handleSave = useCallback(async () => {
        if (!input || !result) {
            setErrors("入力内容が不足しています。もう一度確認してください。");
            return false;
        }

        setSubmitting(true);
        try {
            const response = await fetch("/api/simulations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(schemaPayload),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                const message =
                    data?.error?.message ??
                    "保存に失敗しました。入力内容をご確認ください。";
                setErrors(message);
                setToast({ message, type: "error" });
                setSubmitting(false);
                return false;
            }

            const data = await response.json();
            setSaveSummary({
                id: data.id,
                createdAt: data.createdAt,
                maxLoan: data.results.maxLoan,
                wishLoan: data.results.wishLoan,
            });
            setToast({
                message: "保存しました。メール送信は後日実装予定です。",
                type: "success",
            });
            setSubmitting(false);
            return true;
        } catch (error) {
            console.error("Failed to save simulation", error);
            const message =
                "保存中にエラーが発生しました。通信環境をご確認のうえ、再度お試しください。";
            setErrors(message);
            setToast({ message, type: "error" });
            setSubmitting(false);
            return false;
        }
    }, [input, result, schemaPayload]);

    const handleNext = useCallback(async () => {
        if (activeStep.id === "complete") {
            router.replace("/done");
            return;
        }

        if (activeStep.id !== "max_loan" && activeStep.id !== "adjust") {
            if (!validateStep()) {
                return;
            }
        }

        if (activeStep.id === "max_loan" && !result) {
            setErrors("必要な情報が不足しているため、借入可能額を計算できません。前のステップを確認してください。");
            return;
        }

        if (activeStep.id === "bonus_toggle" && !form.bonusEnabled) {
            setDirection(1);
            setCurrentStepIndex((prev) =>
                Math.min(prev + 2, steps.length - 1)
            );
            return;
        }

        if (activeStep.id === "adjust") {
            const saved = await handleSave();
            if (saved) {
                setDirection(1);
                setCurrentStepIndex((prev) =>
                    Math.min(prev + 1, steps.length - 1)
                );
            }
            return;
        }

        setDirection(1);
        setCurrentStepIndex((prev) =>
            Math.min(prev + 1, steps.length - 1)
        );
    }, [activeStep.id, form.bonusEnabled, handleSave, result, router, validateStep]);

    const handleBack = useCallback(() => {
        if (currentStepIndex === 0) {
            return;
        }

        setErrors(null);
        setDirection(-1);

        if (activeStep.id === "max_loan" && !form.bonusEnabled) {
            setCurrentStepIndex((prev) => Math.max(prev - 2, 0));
            return;
        }

        setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
    }, [activeStep.id, currentStepIndex, form.bonusEnabled]);

    const primaryActionLabel = useMemo(() => {
        switch (activeStep.id) {
            case "max_loan":
                return "条件の微調整へ";
            case "adjust":
                return submitting ? "保存中..." : "この内容で保存";
            case "complete":
                return "完了画面へ";
            default:
                return "次へ";
        }
    }, [activeStep.id, submitting]);

    const maxLoanFormatted = result ? formatYen(result.maxLoan) : "—";
    const wishLoanFormatted = result ? formatYen(result.wishLoan) : "—";
    const tsuboText =
        result != null
            ? `約 ${formatNumber(result.tsubo, 2)} 坪（${formatNumber(result.squareMeters, 2)}㎡）`
            : "—";

    const renderField = () => {
        switch (activeStep.id) {
            case "age":
            case "income_husband":
            case "income_wife":
            case "other_loan":
            case "head_money":
            case "wish_monthly":
            case "term_years":
            case "bonus_amount": {
                const fieldMap: Record<
                    StepId,
                    { value: string; key: keyof FormState }
                > = {
                    age: { value: form.age, key: "age" },
                    income_husband: {
                        value: form.incomeHusband,
                        key: "incomeHusband",
                    },
                    income_wife: {
                        value: form.incomeWife,
                        key: "incomeWife",
                    },
                    other_loan: {
                        value: form.otherLoanAnnualRepay,
                        key: "otherLoanAnnualRepay",
                    },
                    head_money: {
                        value: form.headMoney,
                        key: "headMoney",
                    },
                    wish_monthly: {
                        value: form.wishMonthly,
                        key: "wishMonthly",
                    },
                    term_years: {
                        value: form.termYearsSelected,
                        key: "termYearsSelected",
                    },
                    bonus_amount: {
                        value: form.bonusPerPayment,
                        key: "bonusPerPayment",
                    },
                    adjust: { value: "", key: "age" },
                    postal_code: { value: form.postalCode, key: "postalCode" },
                    has_land: { value: "", key: "age" },
                    max_loan: { value: "", key: "age" },
                    bonus_toggle: { value: "", key: "age" },
                    complete: { value: "", key: "age" },
                };

                const { value, key } = fieldMap[activeStep.id];
                const isCurrencyField =
                    activeStep.id !== "age" && activeStep.id !== "term_years";

                if (isCurrencyField) {
                    return (
                        <div className="flex items-stretch overflow-hidden rounded-xl border bg-background shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
                            <Input
                                ref={setInputNode}
                                type="number"
                                value={value}
                                onChange={(event) =>
                                    updateField(key, event.target.value)
                                }
                                onKeyDown={handleInputKeyDown}
                                placeholder={activeStep.placeholder}
                                inputMode="numeric"
                                className="h-12 flex-1 rounded-none border-0 bg-transparent px-4 text-base focus-visible:border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            <span className="flex items-center bg-muted px-4 text-sm font-medium text-muted-foreground">
                                万円
                            </span>
                        </div>
                    );
                }

                return (
                    <Input
                        ref={setInputNode}
                        type="number"
                        value={value}
                        onChange={(event) =>
                            updateField(key, event.target.value)
                        }
                        onKeyDown={handleInputKeyDown}
                        placeholder={activeStep.placeholder}
                        inputMode="numeric"
                        className="h-12 rounded-xl px-4 text-base"
                    />
                );
            }
            case "postal_code":
                return (
                    <Input
                        ref={setInputNode}
                        value={form.postalCode}
                        onChange={(event) =>
                            updateField("postalCode", event.target.value)
                        }
                        onKeyDown={handleInputKeyDown}
                        placeholder={activeStep.placeholder}
                        className="h-12 rounded-xl px-4 text-base"
                    />
                );
            case "has_land":
                return (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {[
                            { label: "はい（土地あり）", value: true },
                            { label: "いいえ（これから探す）", value: false },
                        ].map((option) => {
                            const isActive = form.hasLand === option.value;
                            return (
                                <Button
                                    key={option.label}
                                    type="button"
                                    variant={isActive ? "default" : "outline"}
                                    onClick={() => updateField("hasLand", option.value)}
                                    className="h-auto rounded-xl px-4 py-3 text-sm"
                                >
                                    {option.label}
                                </Button>
                            );
                        })}
                    </div>
                );
            case "max_loan":
                return (
                    <div className="space-y-4">
                        <div className="rounded-xl border border-primary/40 bg-primary/10 p-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                お二人で借りられる上限額（目安）
                            </p>
                            <p className="mt-2 text-3xl font-bold text-primary">
                                {maxLoanFormatted}
                            </p>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>{cautionText}</p>
                            <p>{bonusNote}</p>
                            <p className="text-xs">{unitNote}</p>
                        </div>
                    </div>
                );
            case "bonus_toggle":
                return (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {[
                            { label: "利用する", value: true },
                            { label: "利用しない", value: false },
                        ].map((option) => {
                            const isActive = form.bonusEnabled === option.value;
                            return (
                                <Button
                                    key={option.label}
                                    type="button"
                                    variant={isActive ? "default" : "outline"}
                                    onClick={() => {
                                        updateField("bonusEnabled", option.value);
                                        if (!option.value) {
                                            updateField("bonusPerPayment", "0");
                                        }
                                    }}
                                    className="h-auto rounded-xl px-4 py-3 text-sm"
                                >
                                    {option.label}
                                </Button>
                            );
                        })}
                    </div>
                );
            case "adjust": {
                const wishMonthlyValue = Number(form.wishMonthly || "0");
                const bonusPerPaymentValue = Number(form.bonusPerPayment || "0");
                const termYearsValue = Number(form.termYearsSelected || "1");

                return (
                    <div className="space-y-6">
                        {result ? (
                            <>
                                <div className="space-y-2">
                                    <label
                                        htmlFor="adjust-wish-monthly"
                                        className="text-sm font-medium text-muted-foreground"
                                    >
                                        月返済額（希望）
                                    </label>
                                    <div className="flex items-stretch overflow-hidden rounded-xl border bg-background shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
                                        <Input
                                            id="adjust-wish-monthly"
                                            type="number"
                                            min={0}
                                            step={1}
                                            value={form.wishMonthly}
                                            onChange={(event) =>
                                                updateField("wishMonthly", event.target.value)
                                            }
                                        />
                                        <span className="flex items-center bg-muted px-4 text-sm font-medium text-muted-foreground">
                                            万円
                                        </span>
                                    </div>
                                    <input
                                        id="adjust-wish-monthly-slider"
                                        type="range"
                                        min={0}
                                        max={50}
                                        step={1}
                                        value={wishMonthlyValue}
                                        onChange={(event) =>
                                            updateField("wishMonthly", event.target.value)
                                        }
                                        className="w-full accent-primary"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="adjust-term-years"
                                        className="text-sm font-medium text-muted-foreground"
                                    >
                                        返済期間（年）
                                    </label>
                                    <Input
                                        id="adjust-term-years"
                                        type="number"
                                        min={1}
                                        max={maxTermByAge}
                                        value={form.termYearsSelected}
                                        onChange={(event) =>
                                            updateField("termYearsSelected", event.target.value)
                                        }
                                    />
                                    <input
                                        id="adjust-term-years-slider"
                                        type="range"
                                        min={1}
                                        max={Math.max(1, maxTermByAge)}
                                        step={1}
                                        value={Math.min(
                                            termYearsValue || 1,
                                            Math.max(1, maxTermByAge)
                                        )}
                                        onChange={(event) =>
                                            updateField("termYearsSelected", event.target.value)
                                        }
                                        className="w-full accent-primary"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        年齢から算出した最大返済期間は {maxTermByAge} 年です。
                                    </p>
                                </div>

                                {form.bonusEnabled ? (
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="adjust-bonus-per-payment"
                                            className="text-sm font-medium text-muted-foreground"
                                        >
                                            ボーナス1回あたりの返済額
                                        </label>
                                        <div className="flex items-stretch overflow-hidden rounded-xl border bg-background shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
                                            <Input
                                                id="adjust-bonus-per-payment"
                                                type="number"
                                                min={0}
                                                step={1}
                                                value={form.bonusPerPayment}
                                                onChange={(event) =>
                                                    updateField("bonusPerPayment", event.target.value)
                                                }
                                            />
                                            <span className="flex items-center bg-muted px-4 text-sm font-medium text-muted-foreground">
                                                万円
                                            </span>
                                        </div>
                                        <input
                                            id="adjust-bonus-slider"
                                            type="range"
                                            min={0}
                                            max={200}
                                            step={5}
                                            value={bonusPerPaymentValue}
                                            onChange={(event) =>
                                                updateField("bonusPerPayment", event.target.value)
                                            }
                                            className="w-full accent-primary"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            年間ボーナス返済額 {result ? formatYen(result.bonusAnnual) : "—"}
                                        </p>
                                    </div>
                                ) : null}

                                <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            借入可能上限額
                                        </p>
                                        <p className="text-lg font-semibold text-primary">
                                            {maxLoanFormatted}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            希望条件での借入額
                                        </p>
                                        <p className="text-xl font-bold">
                                            {wishLoanFormatted}
                                        </p>
                                    </div>
                                    <Progress
                                        value={(result.ratio ?? 0) * 100}
                                        className="h-2"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        WishLoan / MaxLoan ={" "}
                                        {result ? formatNumber(result.ratio * 100, 1) : "—"}%
                                    </p>
                                </div>

                                <div className="rounded-xl border border-border bg-muted/10 p-5 space-y-2">
                                    <p className="text-sm font-medium">
                                        この予算での参考延床面積
                                    </p>
                                    <p className="text-lg">{tsuboText}</p>
                                    <p className="text-xs text-muted-foreground">
                                        頭金と借入希望額を合算した建築予算から算出した目安です。
                                    </p>
                                </div>

                                <div className="text-sm text-muted-foreground space-y-2">
                                    <p>{cautionText}</p>
                                    <p>{bonusNote}</p>
                                    <p className="text-xs">{unitNote}</p>
                                </div>
                            </>
                        ) : (
                            <div className="rounded-md border border-dashed border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                                必要な情報が不足しています。前のステップに戻って入力を完了してください。
                            </div>
                        )}
                    </div>
                );
            }
            case "complete":
                return (
                    <div className="space-y-4 text-center">
                        <p className="text-muted-foreground">
                            シミュレーション結果を保存しました。メール送信は今後実装予定です。
                        </p>
                        {saveSummary ? (
                            <div className="mx-auto max-w-sm space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
                                <p>
                                    保存ID:{" "}
                                    <span className="font-mono">{saveSummary.id}</span>
                                </p>
                                <p>
                                    保存日時:{" "}
                                    {new Date(saveSummary.createdAt).toLocaleString("ja-JP")}
                                </p>
                                <p>借入可能上限額: {formatYen(saveSummary.maxLoan)}</p>
                                <p>希望条件での借入額: {formatYen(saveSummary.wishLoan)}</p>
                            </div>
                        ) : null}
                        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                            <Button
                                type="button"
                                onClick={() => {
                                    setDirection(-1);
                                    setCurrentStepIndex(
                                        steps.findIndex((step) => step.id === "adjust")
                                    );
                                }}
                            >
                                編集に戻る
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setForm({
                                        age: "",
                                        postalCode: "",
                                        incomeHusband: "",
                                        incomeWife: "",
                                        otherLoanAnnualRepay: "",
                                        headMoney: "",
                                        hasLand: null,
                                        wishMonthly: "15",
                                        termYearsSelected: "35",
                                        bonusEnabled: false,
                                        bonusPerPayment: "30",
                                    });
                                    setSaveSummary(null);
                                    setErrors(null);
                                    setDirection(-1);
                                    setCurrentStepIndex(0);
                                }}
                            >
                                最初からやり直す
                            </Button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center gap-8 px-6 py-12 text-foreground">
            <header className="w-full max-w-xl space-y-3 text-center">
                <Badge
                    variant="secondary"
                    className="mx-auto w-fit rounded-full px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em]"
                >
                    Step {currentStepNumber} / {TOTAL_STEPS}
                </Badge>
                <Progress value={progress} className="h-2" />
            </header>

            <Card className="mx-auto w-full max-w-xl overflow-hidden p-0 shadow-lg">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={activeStep.id}
                        custom={direction}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="flex h-full flex-col gap-6 p-6"
                    >
                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-semibold">
                                {activeStep.title}
                            </h1>
                            {activeStep.description ? (
                                <p className="text-sm text-muted-foreground">
                                    {activeStep.description}
                                </p>
                            ) : null}
                        </div>

                        <div className="flex-1 space-y-4">{renderField()}</div>

                        {errors ? (
                            <p className="text-sm font-medium text-destructive text-center">
                                {errors}
                            </p>
                        ) : null}
                    </motion.div>
                </AnimatePresence>
            </Card>

            {activeStep.id !== "complete" ? (
                <div className="mt-auto flex w-full max-w-xl items-center justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStepIndex === 0}
                        className="rounded-full px-6"
                    >
                        戻る
                    </Button>
                    <Button
                        type="button"
                        onClick={handleNext}
                        disabled={
                            activeStep.id === "adjust"
                                ? submitting
                                : false
                        }
                        size="lg"
                        className="rounded-full px-8"
                    >
                        {primaryActionLabel}
                    </Button>
                </div>
            ) : null}

            {toast ? (
                <div
                    className={`fixed bottom-6 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-md border px-4 py-3 text-center shadow-lg ${toast.type === "success"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-900"
                        : "border-destructive bg-destructive/10 text-destructive"
                        }`}
                >
                    <p className="text-sm">{toast.message}</p>
                </div>
            ) : null}
        </main>
    );
}

export default function IntakePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <IntakePageContent />
        </Suspense>
    );
}
