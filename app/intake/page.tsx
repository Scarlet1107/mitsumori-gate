"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

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

const TOTAL_STEPS = 8;

const PROJECT_OPTIONS = [
    { value: "new", label: "新築" },
    { value: "reform", label: "リフォーム" },
    { value: "warehouse", label: "倉庫・その他" },
] as const;

interface FormState {
    customer_name: string;
    phone: string;
    email: string;
    address: string;
    annual_income: string;
    budget_total: string;
    project_type: string;
}

type FieldKey = keyof FormState;

type InputMode =
    | "none"
    | "text"
    | "tel"
    | "email"
    | "numeric"
    | "decimal"
    | "search"
    | "url";

type StepConfig = {
    id: FieldKey | "confirm";
    title: string;
    description?: string;
    placeholder?: string;
    required?: boolean;
    inputType?: "text" | "tel" | "email";
    inputMode?: InputMode;
    autoComplete?: string;
};

const steps: StepConfig[] = [
    {
        id: "customer_name",
        title: "お名前を教えてください",
        placeholder: "例）山田 花子",
        required: true,
        inputMode: "text",
        autoComplete: "name",
    },
    {
        id: "phone",
        title: "ご連絡先（電話番号）",
        placeholder: "例）0242-39-1234",
        inputType: "tel",
        inputMode: "tel",
        autoComplete: "tel",
        required: true,
    },
    {
        id: "email",
        title: "メールアドレス（任意）",
        placeholder: "例）aizu@example.com",
        inputType: "email",
        inputMode: "email",
        autoComplete: "email",
    },
    {
        id: "address",
        title: "ご住所（任意）",
        placeholder: "例）福島県会津若松市七日町…",
        inputMode: "text",
        autoComplete: "street-address",
    },
    {
        id: "annual_income",
        title: "ご世帯の年間収入（概算）",
        placeholder: "例）650",
        description: "数字のみで入力してください（単位：万円）",
        inputMode: "numeric",
    },
    {
        id: "budget_total",
        title: "総予算（概算）",
        placeholder: "例）2800",
        description: "数字のみで入力してください（単位：万円）",
        inputMode: "numeric",
    },
    {
        id: "project_type",
        title: "ご希望の内容をお選びください",
    },
    {
        id: "confirm",
        title: "入力内容の確認",
        description: "送信前にいま一度ご確認ください。",
    },
];

export default function IntakePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState<1 | -1>(1);
    const [form, setForm] = useState<FormState>({
        customer_name: "",
        phone: "",
        email: "",
        address: "",
        annual_income: "",
        budget_total: "",
        project_type: "",
    });
    const [errors, setErrors] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const consent = searchParams.get("consent");
    const from = searchParams.get("from") ?? undefined;

    useEffect(() => {
        if (consent !== "true") {
            router.replace("/consent");
        }
    }, [consent, router]);

    const questionStepIndex = useMemo(() => {
        return Math.min(currentStep, steps.length - 1);
    }, [currentStep]);

    const activeStep = steps[questionStepIndex];

    const displayStepNumber = Math.min(questionStepIndex + 2, TOTAL_STEPS);
    const progress = (displayStepNumber / TOTAL_STEPS) * 100;

    const handleInputChange = (key: FieldKey, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors(null);
    };

    const validateCurrentStep = () => {
        if (activeStep.id === "confirm") {
            return true;
        }

        if (activeStep.required) {
            const value = form[activeStep.id];
            if (!value.trim()) {
                setErrors("必須項目です");
                return false;
            }
        }

        if (activeStep.id === "phone") {
            const phone = form.phone.trim();
            if (!/^[0-9+\-]{8,15}$/u.test(phone)) {
                setErrors("電話番号の形式を確認してください");
                return false;
            }
        }

        if (activeStep.id === "email" && form.email.trim().length > 0) {
            const email = form.email.trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) {
                setErrors("メールアドレスの形式を確認してください");
                return false;
            }
        }

        if (
            (activeStep.id === "annual_income" || activeStep.id === "budget_total") &&
            form[activeStep.id].trim().length > 0
        ) {
            const numericValue = Number.parseInt(form[activeStep.id], 10);
            if (!Number.isFinite(numericValue) || numericValue < 0) {
                setErrors("0以上の数値で入力してください");
                return false;
            }
        }

        if (activeStep.id === "project_type" && !form.project_type) {
            setErrors("いずれかを選択してください");
            return false;
        }

        return true;
    };

    const handleNext = async () => {
        if (!validateCurrentStep()) {
            return;
        }

        if (activeStep.id === "confirm") {
            try {
                setSubmitting(true);
                const response = await fetch("/api/intakes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        consent: true,
                        customer_name: form.customer_name.trim(),
                        phone: form.phone.trim(),
                        email: form.email.trim() || undefined,
                        address: form.address.trim() || undefined,
                        annual_income:
                            form.annual_income.trim().length > 0
                                ? Number.parseInt(form.annual_income, 10)
                                : undefined,
                        budget_total:
                            form.budget_total.trim().length > 0
                                ? Number.parseInt(form.budget_total, 10)
                                : undefined,
                        project_type: form.project_type || undefined,
                        from,
                    }),
                });

                if (!response.ok) {
                    const json = await response.json().catch(() => null);
                    const message =
                        json?.error?.message ?? "送信中に問題が発生しました。もう一度お試しください。";
                    setErrors(message);
                    setSubmitting(false);
                    return;
                }

                router.replace("/done");
            } catch (error) {
                console.error(error);
                setErrors("通信に失敗しました。時間をおいて再度お試しください。");
                setSubmitting(false);
            }
            return;
        }

        setDirection(1);
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    };

    const handleBack = () => {
        setErrors(null);
        setDirection(-1);
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        void handleNext();
    };

    const renderField = () => {
        if (activeStep.id === "project_type") {
            return (
                <div className="grid gap-3 sm:grid-cols-3">
                    {PROJECT_OPTIONS.map((option) => {
                        const isActive = form.project_type === option.value;
                        return (
                            <Button
                                type="button"
                                key={option.value}
                                variant={isActive ? "default" : "outline"}
                                onClick={() => handleInputChange("project_type", option.value)}
                                className="h-auto rounded-xl px-4 py-3 text-sm"
                            >
                                {option.label}
                            </Button>
                        );
                    })}
                </div>
            );
        }

        if (activeStep.id === "confirm") {
            const summary = [
                { label: "お名前", value: form.customer_name || "-" },
                { label: "電話番号", value: form.phone || "-" },
                { label: "メールアドレス", value: form.email || "-" },
                { label: "ご住所", value: form.address || "-" },
                {
                    label: "年間収入（万円）",
                    value: form.annual_income ? `${form.annual_income} 万円` : "-",
                },
                {
                    label: "総予算（万円）",
                    value: form.budget_total ? `${form.budget_total} 万円` : "-",
                },
                {
                    label: "希望内容",
                    value:
                        PROJECT_OPTIONS.find((option) => option.value === form.project_type)?.label || "-",
                },
            ];

            return (
                <dl className="space-y-3">
                    {summary.map((item) => (
                        <div
                            key={item.label}
                            className="rounded-lg border bg-muted/20 px-4 py-3"
                        >
                            <SummaryItem label={item.label} value={item.value} />
                        </div>
                    ))}
                </dl>
            );
        }

        const isCurrency =
            activeStep.id === "annual_income" || activeStep.id === "budget_total";
        const value = form[activeStep.id as FieldKey];
        const type = activeStep.inputType ?? "text";

        if (isCurrency) {
            return (
                <div className="flex items-stretch overflow-hidden rounded-xl border bg-background shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
                    <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={value}
                        onChange={(event) =>
                            handleInputChange(activeStep.id as FieldKey, event.target.value)
                        }
                        onKeyDown={handleInputKeyDown}
                        placeholder={activeStep.placeholder}
                        autoComplete={activeStep.autoComplete}
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
                type={type}
                inputMode={activeStep.inputMode}
                value={value}
                onChange={(event) =>
                    handleInputChange(activeStep.id as FieldKey, event.target.value)
                }
                onKeyDown={handleInputKeyDown}
                placeholder={activeStep.placeholder}
                autoComplete={activeStep.autoComplete}
                className="h-12 rounded-xl px-4 text-base"
            />
        );
    };

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-12 text-foreground">
            <header className="space-y-3">
                <Badge
                    variant="secondary"
                    className="w-fit rounded-full px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em]"
                >
                    Step {displayStepNumber} / {TOTAL_STEPS}
                </Badge>
                <Progress value={progress} className="h-2" />
            </header>

            <Card className="min-h-[440px] gap-0 overflow-hidden p-0">
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
                        <div className="space-y-2">
                            <h1 className="text-2xl font-semibold text-foreground">
                                {activeStep.title}
                            </h1>
                            {activeStep.description ? (
                                <p className="text-sm text-muted-foreground">
                                    {activeStep.description}
                                </p>
                            ) : null}
                        </div>

                        <div className="flex-1">{renderField()}</div>

                        {errors ? (
                            <p className="text-sm font-medium text-destructive">{errors}</p>
                        ) : null}
                    </motion.div>
                </AnimatePresence>
            </Card>

            <div className="mt-auto flex items-center justify-between">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={questionStepIndex === 0}
                    className="rounded-full px-6"
                >
                    戻る
                </Button>
                <Button
                    type="button"
                    onClick={handleNext}
                    disabled={submitting}
                    size="lg"
                    className="rounded-full px-8"
                >
                    {activeStep.id === "confirm" ? (submitting ? "送信中..." : "送信する") : "次へ"}
                </Button>
            </div>
        </main>
    );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-1 text-base text-foreground">{value}</dd>
        </div>
    );
}
