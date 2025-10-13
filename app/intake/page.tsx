"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

type StepConfig = {
    id: FieldKey | "confirm";
    title: string;
    description?: string;
    placeholder?: string;
    required?: boolean;
    inputType?: "text" | "tel" | "number";
};

const steps: StepConfig[] = [
    {
        id: "customer_name",
        title: "お名前を教えてください",
        placeholder: "例）山田太郎",
        required: true,
    },
    {
        id: "phone",
        title: "ご連絡先（電話番号）",
        placeholder: "例）09012345678",
        inputType: "tel",
        required: true,
    },
    {
        id: "email",
        title: "メールアドレス（任意）",
        placeholder: "taro@example.com",
    },
    {
        id: "address",
        title: "ご住所（任意）",
    },
    {
        id: "annual_income",
        title: "ご世帯の年間収入（概算）",
        description: "単位は万円です（例：600 = 600万円）",
        inputType: "number",
    },
    {
        id: "budget_total",
        title: "総予算（概算）",
        description: "単位は万円です（例：2000 = 2000万円）",
        inputType: "number",
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
            const value = Number.parseInt(form[activeStep.id], 10);
            if (!Number.isFinite(value) || value < 0) {
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

        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    };

    const handleBack = () => {
        setErrors(null);
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const renderField = () => {
        if (activeStep.id === "project_type") {
            return (
                <div className="grid gap-3 sm:grid-cols-3">
                    {PROJECT_OPTIONS.map((option) => (
                        <button
                            type="button"
                            key={option.value}
                            onClick={() => handleInputChange("project_type", option.value)}
                            className={`rounded-xl border px-4 py-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 ${form.project_type === option.value
                                    ? "border-slate-900 bg-slate-900 text-white"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            );
        }

        if (activeStep.id === "confirm") {
            return (
                <dl className="grid gap-4">
                    <SummaryItem label="お名前" value={form.customer_name || "-"} />
                    <SummaryItem label="電話番号" value={form.phone || "-"} />
                    <SummaryItem label="メールアドレス" value={form.email || "-"} />
                    <SummaryItem label="ご住所" value={form.address || "-"} />
                    <SummaryItem
                        label="年間収入（万円）"
                        value={form.annual_income || "-"}
                    />
                    <SummaryItem label="総予算（万円）" value={form.budget_total || "-"} />
                    <SummaryItem
                        label="ご希望の内容"
                        value={
                            PROJECT_OPTIONS.find((option) => option.value === form.project_type)?.label ||
                            "-"
                        }
                    />
                </dl>
            );
        }

        const inputType = activeStep.inputType ?? "text";

        return (
            <input
                type={inputType}
                inputMode={inputType === "number" ? "numeric" : undefined}
                value={form[activeStep.id as FieldKey]}
                onChange={(event) =>
                    handleInputChange(activeStep.id as FieldKey, event.target.value)
                }
                placeholder={activeStep.placeholder}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none"
            />
        );
    };

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-6 py-12 text-slate-900">
            <header className="space-y-2">
                <p className="text-sm font-medium text-slate-500">
                    Step {displayStepNumber} / {TOTAL_STEPS}
                </p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <span
                        className="block h-full rounded-full bg-slate-900 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </header>

            <section className="min-h-[380px] rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="space-y-3">
                    <h1 className="text-2xl font-semibold">{activeStep.title}</h1>
                    {activeStep.description ? (
                        <p className="text-sm text-slate-500">{activeStep.description}</p>
                    ) : null}
                </div>

                <div className="mt-8">{renderField()}</div>

                {errors ? (
                    <p className="mt-4 text-sm text-red-500">{errors}</p>
                ) : null}
            </section>

            <div className="mt-auto flex items-center justify-between">
                <button
                    type="button"
                    onClick={handleBack}
                    disabled={questionStepIndex === 0}
                    className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition enabled:hover:border-slate-500 enabled:hover:text-slate-900 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                >
                    戻る
                </button>
                <button
                    type="button"
                    onClick={handleNext}
                    disabled={submitting}
                    className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-slate-900/10 transition enabled:hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                    {activeStep.id === "confirm" ? (submitting ? "送信中..." : "送信する") : "次へ"}
                </button>
            </div>
        </main>
    );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {label}
            </dt>
            <dd className="mt-1 text-base text-slate-800">{value}</dd>
        </div>
    );
}
