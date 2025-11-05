"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Progress } from "@/components/ui/progress";
import type { SimulationResult } from "@/lib/calculation";
import { getAddressFromPostalCode, formatPostalCode, isValidPostalCode } from "@/lib/postal-address";

type StepId =
    | "name"
    | "email"
    | "age"
    | "postal_code"
    | "own_income"
    | "own_loan_payment"
    | "spouse_question"
    | "spouse_income"
    | "spouse_loan_payment"
    | "down_payment"
    | "budget_display"
    | "wish_monthly"
    | "wish_years"
    | "bonus_question"
    | "land_question"
    | "techno_question"
    | "loan_display"
    | "floor_plan_display"
    | "adjustment"
    | "adjusted_plan_display"
    | "complete";

interface StepConfig {
    id: StepId;
    title: string;
    description?: string;
    placeholder?: string;
    required?: boolean;
    type?: "text" | "number" | "email" | "display" | "question";
}

const steps: StepConfig[] = [
    {
        id: "name",
        title: "お名前を教えてください",
        placeholder: "例）山田太郎",
        required: true,
        type: "text",
    },
    {
        id: "email",
        title: "メールアドレスを入力してください",
        placeholder: "例）yamada@example.com",
        required: true,
        type: "email",
    },
    {
        id: "age",
        title: "年齢を教えてください",
        description: "完済時年齢の目安を計算するために使用します",
        placeholder: "例）35",
        required: true,
        type: "number",
    },
    {
        id: "postal_code",
        title: "郵便番号を入力してください",
        placeholder: "例）123-4567",
        required: true,
        type: "text",
    },
    {
        id: "own_income",
        title: "ご自身の年収を教えてください",
        description: "単位：万円",
        placeholder: "例）600",
        required: true,
        type: "number",
    },
    {
        id: "own_loan_payment",
        title: "ご自身の毎月の借り入れ返済額を入力してください",
        description: "単位：万円",
        placeholder: "例）5",
        required: true,
        type: "number",
    },
    {
        id: "spouse_question",
        title: "配偶者はいらっしゃいますか？",
        type: "question",
    },
    {
        id: "spouse_income",
        title: "配偶者の年収を教えてください",
        description: "単位：万円",
        placeholder: "例）400",
        required: true,
        type: "number",
    },
    {
        id: "spouse_loan_payment",
        title: "配偶者の毎月の借り入れ返済額を入力してください",
        description: "単位：万円",
        placeholder: "例）3",
        required: true,
        type: "number",
    },
    {
        id: "down_payment",
        title: "頭金を入力してください",
        description: "単位：万円",
        placeholder: "例）500",
        required: true,
        type: "number",
    },
    {
        id: "budget_display",
        title: "あなたの上限予算",
        description: "頭金＋借入上限額",
        type: "display",
    },
    {
        id: "wish_monthly",
        title: "希望する返済金額（月）を入力してください",
        description: "単位：万円",
        placeholder: "例）15",
        required: true,
        type: "number",
    },
    {
        id: "wish_years",
        title: "希望する返済期間（年）を入力してください",
        description: "年齢から算出した上限内で入力してください",
        placeholder: "例）35",
        required: true,
        type: "number",
    },
    {
        id: "bonus_question",
        title: "ボーナス返済は利用しますか？",
        description: "年2回のボーナス返済",
        type: "question",
    },
    {
        id: "land_question",
        title: "土地はお持ちですか？",
        type: "question",
    },
    {
        id: "techno_question",
        title: "テクノストラクチャーを利用しますか？",
        type: "question",
    },
    {
        id: "loan_display",
        title: "希望条件で借りれる金額",
        type: "display",
    },
    {
        id: "floor_plan_display",
        title: "希望条件で作れる図面のイメージ",
        type: "display",
    },
    {
        id: "adjustment",
        title: "条件を調整",
        description: "スライダーを動かして条件を調整できます",
        type: "display",
    },
    {
        id: "adjusted_plan_display",
        title: "調整後の条件で作れる図面のイメージ",
        type: "display",
    },
    {
        id: "complete",
        title: "ご入力ありがとうございました。より詳細については来店いただいた際にお見せできます。",
        type: "display",
    },
];

interface FormData {
    name: string;
    email: string;
    age: string;
    postalCode: string;
    address: string;          // 郵便番号から取得された住所
    ownIncome: string;
    ownLoanPayment: string;
    hasSpouse: boolean | null;
    spouseIncome: string;
    spouseLoanPayment: string;
    downPayment: string;
    wishMonthlyPayment: string;
    wishPaymentYears: string;
    usesBonus: boolean | null;
    hasLand: boolean | null;
    usesTechnostructure: boolean | null;
}

export default function WebFormPage() {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [direction, setDirection] = useState<1 | -1>(1);
    const [form, setForm] = useState<FormData>({
        name: "",
        email: "",
        age: "",
        postalCode: "",
        address: "",
        ownIncome: "",
        ownLoanPayment: "",
        hasSpouse: null,
        spouseIncome: "",
        spouseLoanPayment: "",
        downPayment: "",
        wishMonthlyPayment: "",
        wishPaymentYears: "",
        usesBonus: null,
        hasLand: null,
        usesTechnostructure: null,
    });
    const [errors, setErrors] = useState<string | null>(null);
    const [simulation, setSimulation] = useState<SimulationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const [autoProgressTimer, setAutoProgressTimer] = useState<NodeJS.Timeout | null>(null);
    const [addressLoading, setAddressLoading] = useState(false);

    // コンポーネントのクリーンアップ時にタイマーをクリア
    useEffect(() => {
        return () => {
            if (autoProgressTimer) {
                clearTimeout(autoProgressTimer);
            }
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [autoProgressTimer, debounceTimer]);

    // 進捗保持機能：初期化時にlocalStorageから復元
    useEffect(() => {
        try {
            const savedProgress = localStorage.getItem("webform-progress");
            const savedForm = localStorage.getItem("webform-data");

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
    }, []);

    // 進捗保持機能：フォームデータ変更時に自動保存
    useEffect(() => {
        localStorage.setItem("webform-data", JSON.stringify(form));
    }, [form]);

    // 進捗保持機能：ステップ変更時に進捗保存
    useEffect(() => {
        localStorage.setItem("webform-progress", currentStepIndex.toString());
    }, [currentStepIndex]);

    const activeStep = steps[currentStepIndex];
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    const updateField = useCallback(<K extends keyof FormData>(
        field: K,
        value: FormData[K]
    ) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrors(null);
    }, []);

    // 郵便番号から住所を自動取得（webフォームでは基本住所のみ）
    const fetchAddressFromPostalCode = useCallback(async (postalCode: string) => {
        if (!isValidPostalCode(postalCode)) {
            return;
        }

        setAddressLoading(true);
        try {
            const result = await getAddressFromPostalCode(postalCode);

            if (result.success && result.data) {
                setForm(prev => ({
                    ...prev,
                    address: result.data!.fullAddress
                }));
            } else {
                setErrors(result.error || "住所の取得に失敗しました");
            }
        } catch (error) {
            console.error("Address lookup error:", error);
            setErrors("住所の取得中にエラーが発生しました");
        } finally {
            setAddressLoading(false);
        }
    }, []); const validateStep = useCallback((): boolean => {
        const step = activeStep;
        setErrors(null);

        switch (step.id) {
            case "name":
                if (!form.name.trim()) {
                    setErrors("お名前を入力してください");
                    return false;
                }
                break;
            case "email":
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!form.email.trim() || !emailRegex.test(form.email)) {
                    setErrors("有効なメールアドレスを入力してください");
                    return false;
                }
                break;
            case "age":
                const age = parseInt(form.age);
                if (!age || age < 20 || age > 75) {
                    setErrors("年齢は20〜75歳で入力してください");
                    return false;
                }
                break;
            case "postal_code":
                if (!form.postalCode.trim()) {
                    setErrors("郵便番号を入力してください");
                    return false;
                }
                if (!isValidPostalCode(form.postalCode)) {
                    setErrors("正しい郵便番号を入力してください（例：123-4567）");
                    return false;
                }
                break;
            case "own_income":
            case "own_loan_payment":
            case "down_payment":
            case "wish_monthly":
            case "wish_years":
                const fieldMap = {
                    own_income: { value: form.ownIncome, name: "年収" },
                    own_loan_payment: { value: form.ownLoanPayment, name: "借入返済額" },
                    down_payment: { value: form.downPayment, name: "頭金" },
                    wish_monthly: { value: form.wishMonthlyPayment, name: "希望月返済額" },
                    wish_years: { value: form.wishPaymentYears, name: "希望返済期間" },
                };
                const field = fieldMap[step.id as keyof typeof fieldMap];
                const value = parseFloat(field.value);
                if (!field.value.trim() || isNaN(value) || value < 0) {
                    setErrors(`${field.name}を正しく入力してください`);
                    return false;
                }
                break;
            case "spouse_income":
            case "spouse_loan_payment":
                if (form.hasSpouse) {
                    const spouseFieldMap = {
                        spouse_income: { value: form.spouseIncome, name: "配偶者の年収" },
                        spouse_loan_payment: { value: form.spouseLoanPayment, name: "配偶者の借入返済額" },
                    };
                    const spouseField = spouseFieldMap[step.id as keyof typeof spouseFieldMap];
                    const spouseValue = parseFloat(spouseField.value);
                    if (!spouseField.value.trim() || isNaN(spouseValue) || spouseValue < 0) {
                        setErrors(`${spouseField.name}を正しく入力してください`);
                        return false;
                    }
                }
                break;
            case "spouse_question":
                if (form.hasSpouse === null) {
                    setErrors("配偶者の有無を選択してください");
                    return false;
                }
                break;
            case "bonus_question":
                if (form.usesBonus === null) {
                    setErrors("ボーナス返済の利用を選択してください");
                    return false;
                }
                break;
            case "land_question":
                if (form.hasLand === null) {
                    setErrors("土地の有無を選択してください");
                    return false;
                }
                break;
            case "techno_question":
                if (form.usesTechnostructure === null) {
                    setErrors("テクノストラクチャーの利用を選択してください");
                    return false;
                }
                break;
        }

        return true;
    }, [activeStep, form]);

    // 最低限の情報で最大借入額のみ計算する関数
    const runPartialSimulation = useCallback(async () => {
        if (!form.ownIncome || !form.downPayment) {
            console.log("Partial simulation skipped - missing basic fields:", {
                ownIncome: form.ownIncome,
                downPayment: form.downPayment,
            });
            return;
        }

        try {
            setLoading(true);
            // APIを通じてシミュレーションを実行
            const response = await fetch("/api/simulation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    age: parseInt(form.age),
                    ownIncome: parseFloat(form.ownIncome),
                    spouseIncome: form.hasSpouse ? parseFloat(form.spouseIncome) || 0 : 0,
                    ownLoanPayment: parseFloat(form.ownLoanPayment) || 0,
                    spouseLoanPayment: form.hasSpouse ? parseFloat(form.spouseLoanPayment) || 0 : 0,
                    downPayment: parseFloat(form.downPayment),
                    wishMonthlyPayment: 10, // 仮の値（最大借入額計算には影響しない）
                    wishPaymentYears: 35, // 仮の値（最大借入額計算には影響しない）
                    usesBonus: form.usesBonus || false,
                    hasLand: form.hasLand || false,
                    usesTechnostructure: form.usesTechnostructure || false,
                }),
            });

            if (!response.ok) {
                throw new Error("シミュレーション計算に失敗しました");
            }

            const result = await response.json();
            console.log("Partial simulation result:", result);
            setSimulation(result);
        } catch (error) {
            console.error("Partial simulation error:", error);
        } finally {
            setLoading(false);
        }
    }, [form.ownIncome, form.downPayment, form.age, form.hasSpouse, form.spouseIncome, form.ownLoanPayment, form.spouseLoanPayment, form.usesBonus, form.hasLand, form.usesTechnostructure]);

    const runSimulation = useCallback(async () => {
        if (!form.ownIncome || !form.downPayment || !form.wishMonthlyPayment || !form.wishPaymentYears) {
            console.log("Full simulation skipped - missing required fields:", {
                ownIncome: form.ownIncome,
                downPayment: form.downPayment,
                wishMonthlyPayment: form.wishMonthlyPayment,
                wishPaymentYears: form.wishPaymentYears
            });
            return;
        }

        try {
            setLoading(true);
            console.log("Running simulation with data:", {
                age: parseInt(form.age),
                ownIncome: parseFloat(form.ownIncome),
                spouseIncome: form.hasSpouse ? parseFloat(form.spouseIncome) || 0 : 0,
                ownLoanPayment: parseFloat(form.ownLoanPayment),
                spouseLoanPayment: form.hasSpouse ? parseFloat(form.spouseLoanPayment) || 0 : 0,
                downPayment: parseFloat(form.downPayment),
                wishMonthlyPayment: parseFloat(form.wishMonthlyPayment),
                wishPaymentYears: parseInt(form.wishPaymentYears),
            });

            const response = await fetch("/api/simulation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    age: parseInt(form.age),
                    ownIncome: parseFloat(form.ownIncome),
                    spouseIncome: form.hasSpouse ? parseFloat(form.spouseIncome) || 0 : 0,
                    ownLoanPayment: parseFloat(form.ownLoanPayment),
                    spouseLoanPayment: form.hasSpouse ? parseFloat(form.spouseLoanPayment) || 0 : 0,
                    downPayment: parseFloat(form.downPayment),
                    wishMonthlyPayment: parseFloat(form.wishMonthlyPayment),
                    wishPaymentYears: parseInt(form.wishPaymentYears),
                    usesBonus: form.usesBonus || false,
                    hasLand: form.hasLand || false,
                    usesTechnostructure: form.usesTechnostructure || false,
                }),
            });

            if (!response.ok) {
                throw new Error("シミュレーション計算に失敗しました");
            }

            const result = await response.json();
            console.log("Simulation result:", result);
            setSimulation(result);
        } catch (error) {
            console.error("Simulation error details:", error);
            console.error("Error message:", error instanceof Error ? error.message : 'Unknown error');
            console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
        } finally {
            setLoading(false);
        }
    }, [form]);

    useEffect(() => {
        // budget_displayは頭金まで入力されていれば部分的シミュレーション
        if (activeStep.id === "budget_display") {
            if (form.ownIncome && form.downPayment) {
                runPartialSimulation();
            }
        }
        // その他の表示は全情報が必要
        else if (activeStep.id === "loan_display" ||
            activeStep.id === "floor_plan_display" ||
            activeStep.id === "adjusted_plan_display") {
            if (form.ownIncome && form.downPayment && form.wishMonthlyPayment && form.wishPaymentYears) {
                runSimulation();
            }
        }
    }, [activeStep.id, runSimulation, runPartialSimulation, form.ownIncome, form.downPayment, form.wishMonthlyPayment, form.wishPaymentYears]);

    const handleNext = useCallback(() => {
        // バリデーション（display以外）
        if (activeStep.type !== "display" && !validateStep()) {
            return;
        }



        // 配偶者関連の条件分岐
        if (activeStep.id === "spouse_question" && !form.hasSpouse) {
            // 配偶者がいない場合は配偶者の年収・返済額をスキップ
            setForm(prev => ({
                ...prev,
                spouseIncome: "0",
                spouseLoanPayment: "0",
            }));
            setDirection(1); // 次へ方向
            setCurrentStepIndex(prev => Math.min(prev + 3, steps.length - 1)); // 2つスキップ
            return;
        }

        setDirection(1); // 次へ方向（右から左へ）
        setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
    }, [activeStep.id, activeStep.type, form.hasSpouse, validateStep]);

    // キーボードイベント処理
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Enterキーで次に進む
            if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
                e.preventDefault();
                handleNext();
            }
            // 文字キーでフォーカス
            else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                const activeElement = document.activeElement;
                // 既にinputにフォーカスがあたっている場合はスキップ
                if (activeElement?.tagName !== "INPUT" && inputRef.current) {
                    inputRef.current.focus();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleNext]);

    // ステップ変更時に自動フォーカス
    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputRef.current && (activeStep.type === "text" || activeStep.type === "email" || activeStep.type === "number")) {
                inputRef.current.focus();
            }
        }, 300); // アニメーション完了後にフォーカス

        return () => clearTimeout(timer);
    }, [currentStepIndex, activeStep.type]);

    const handlePrevious = () => {
        // 配偶者関連の条件分岐（戻る時）
        if (activeStep.id === "down_payment" && !form.hasSpouse) {
            setDirection(-1); // 戻る方向
            setCurrentStepIndex(prev => Math.max(prev - 3, 0)); // 2つ戻る
            return;
        }

        setDirection(-1); // 戻る方向（左から右へ）
        setCurrentStepIndex(prev => Math.max(prev - 1, 0));
    };

    const handleSave = async () => {
        try {
            const response = await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    age: parseInt(form.age),
                    postalCode: form.postalCode,
                    address: form.address,
                    ownIncome: parseFloat(form.ownIncome),
                    spouseIncome: form.hasSpouse ? parseFloat(form.spouseIncome) : 0,
                    ownLoanPayment: parseFloat(form.ownLoanPayment),
                    spouseLoanPayment: form.hasSpouse ? parseFloat(form.spouseLoanPayment) : 0,
                    downPayment: parseFloat(form.downPayment),
                    wishMonthlyPayment: parseFloat(form.wishMonthlyPayment),
                    wishPaymentYears: parseInt(form.wishPaymentYears),
                    hasSpouse: form.hasSpouse,
                    usesBonus: form.usesBonus,
                    hasLand: form.hasLand,
                    usesTechnostructure: form.usesTechnostructure,
                    inputMode: "web",
                    webCompleted: true,
                }),
            });

            if (!response.ok) throw new Error("保存に失敗しました");

            // シミュレーション結果も保存
            if (simulation) {
                const { id } = await response.json();
                await fetch("/api/customer-simulations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        customerId: id,
                        ...simulation,
                    }),
                });
            }

            // フォーム完了時に保存データをクリア
            localStorage.removeItem("webform-progress");
            localStorage.removeItem("webform-data");

            router.push("/done?mode=web");
        } catch {
            setErrors("保存中にエラーが発生しました");
        }
    };

    const renderField = () => {
        switch (activeStep.type) {
            case "text":
            case "email":
            case "number":
                const fieldMap: Record<string, { value: string; key: keyof FormData }> = {
                    name: { value: form.name, key: "name" },
                    email: { value: form.email, key: "email" },
                    age: { value: form.age, key: "age" },
                    postal_code: { value: form.postalCode, key: "postalCode" },
                    own_income: { value: form.ownIncome, key: "ownIncome" },
                    own_loan_payment: { value: form.ownLoanPayment, key: "ownLoanPayment" },
                    spouse_income: { value: form.spouseIncome, key: "spouseIncome" },
                    spouse_loan_payment: { value: form.spouseLoanPayment, key: "spouseLoanPayment" },
                    down_payment: { value: form.downPayment, key: "downPayment" },
                    wish_monthly: { value: form.wishMonthlyPayment, key: "wishMonthlyPayment" },
                    wish_years: { value: form.wishPaymentYears, key: "wishPaymentYears" },
                };

                const field = fieldMap[activeStep.id];
                const isCurrencyField = activeStep.type === "number";
                const isAgeField = activeStep.id === "age";
                const isPostalCodeField = activeStep.id === "postal_code";

                // 郵便番号の場合は特別な表示
                if (isPostalCodeField) {
                    return (
                        <div className="space-y-4">
                            <Input
                                ref={inputRef}
                                type="text"
                                value={field.value}
                                onChange={(e) => {
                                    const value = formatPostalCode(e.target.value);
                                    updateField(field.key, value);
                                    // 7桁になったら住所を自動取得
                                    if (isValidPostalCode(value)) {
                                        fetchAddressFromPostalCode(value);
                                    }
                                }}
                                placeholder={activeStep.placeholder}
                                className="text-base sm:text-lg h-12 sm:h-14 rounded-xl"
                            />
                            {addressLoading && (
                                <div className="text-center text-sm text-muted-foreground">
                                    住所を取得中...
                                </div>
                            )}
                            {form.address && (
                                <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
                                    <div className="text-xs text-muted-foreground mb-1">取得した住所</div>
                                    <div className="text-sm font-medium">{form.address}</div>
                                </div>
                            )}
                        </div>
                    );
                }

                if (isCurrencyField) {
                    return (
                        <div className="flex items-stretch overflow-hidden rounded-xl border bg-background shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
                            <Input
                                ref={inputRef}
                                type="number"
                                value={field.value}
                                onChange={(e) => updateField(field.key, e.target.value)}
                                placeholder={activeStep.placeholder}
                                className="border-0 text-base sm:text-lg h-12 sm:h-14 focus-visible:ring-0"
                            />
                            <span className="flex items-center bg-muted px-3 sm:px-4 text-sm font-medium text-muted-foreground">
                                {isAgeField ? "歳" : "万円"}
                            </span>
                        </div>
                    );
                }

                return (
                    <Input
                        ref={inputRef}
                        type={activeStep.type}
                        value={field.value}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        placeholder={activeStep.placeholder}
                        className="text-base sm:text-lg h-12 sm:h-14 rounded-xl"
                    />
                );

            case "question":
                const questionMap: Record<string, { value: boolean | null; key: keyof FormData; trueLabel: string; falseLabel: string }> = {
                    spouse_question: {
                        value: form.hasSpouse,
                        key: "hasSpouse",
                        trueLabel: "はい",
                        falseLabel: "いいえ"
                    },
                    bonus_question: {
                        value: form.usesBonus,
                        key: "usesBonus",
                        trueLabel: "利用する",
                        falseLabel: "利用しない"
                    },
                    land_question: {
                        value: form.hasLand,
                        key: "hasLand",
                        trueLabel: "あり",
                        falseLabel: "なし"
                    },
                    techno_question: {
                        value: form.usesTechnostructure,
                        key: "usesTechnostructure",
                        trueLabel: "はい",
                        falseLabel: "いいえ"
                    },
                };

                const questionField = questionMap[activeStep.id];

                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <Button
                                type="button"
                                variant={questionField.value === true ? "default" : "outline"}
                                onClick={() => {
                                    // 既存の自動進行タイマーをクリア
                                    if (autoProgressTimer) {
                                        clearTimeout(autoProgressTimer);
                                        setAutoProgressTimer(null);
                                    }

                                    updateField(questionField.key, true);

                                    // 新しい自動進行タイマーをセット
                                    const timer = setTimeout(() => {
                                        handleNext();
                                        setAutoProgressTimer(null);
                                    }, 300);
                                    setAutoProgressTimer(timer);
                                }}
                                className="h-12 sm:h-14 text-base sm:text-lg rounded-xl"
                            >
                                {questionField.trueLabel}
                            </Button>
                            <Button
                                type="button"
                                variant={questionField.value === false ? "default" : "outline"}
                                onClick={() => {
                                    // 既存の自動進行タイマーをクリア
                                    if (autoProgressTimer) {
                                        clearTimeout(autoProgressTimer);
                                        setAutoProgressTimer(null);
                                    }

                                    updateField(questionField.key, false);

                                    // 新しい自動進行タイマーをセット
                                    const timer = setTimeout(() => {
                                        handleNext();
                                        setAutoProgressTimer(null);
                                    }, 300);
                                    setAutoProgressTimer(timer);
                                }}
                                className="h-12 sm:h-14 text-base sm:text-lg rounded-xl"
                            >
                                {questionField.falseLabel}
                            </Button>
                        </div>
                    </div>
                );

            case "display":
                if (activeStep.id === "budget_display") {
                    return (
                        <div className="space-y-6 text-center">
                            {loading ? (
                                <div>計算中...</div>
                            ) : simulation ? (
                                <>
                                    <div className="text-4xl font-bold text-primary">
                                        {Math.round(simulation.maxLoanAmount + parseFloat(form.downPayment)).toLocaleString()}万円
                                    </div>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div>借入上限額: {Math.round(simulation.maxLoanAmount).toLocaleString()}万円</div>
                                        <div>頭金: {form.downPayment}万円</div>
                                        <div className="text-xs text-muted-foreground mt-2">
                                            ※この予算は最大借入可能額に基づいています
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div>計算できませんでした</div>
                            )}
                        </div>
                    );
                }

                if (activeStep.id === "loan_display") {
                    return (
                        <div className="space-y-6 text-center">
                            {simulation ? (
                                <>
                                    <div className="text-4xl font-bold text-primary">
                                        {Math.round(simulation.wishLoanAmount).toLocaleString()}万円
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        希望条件での借入可能額
                                    </div>
                                </>
                            ) : (
                                <div>計算できませんでした</div>
                            )}
                        </div>
                    );
                }

                if (activeStep.id === "floor_plan_display" || activeStep.id === "adjusted_plan_display") {
                    return (
                        <div className="space-y-6 text-center">
                            {simulation ? (
                                <>
                                    <div className="text-2xl font-bold">
                                        約{Math.round(simulation.estimatedTsubo)}坪
                                    </div>
                                    <div className="text-lg">
                                        （{Math.round(simulation.estimatedSquareMeters)}㎡）
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        建築予算: {Math.round(simulation.buildingBudget).toLocaleString()}万円
                                    </div>
                                    <div className="bg-muted/50 p-8 rounded-lg text-muted-foreground">
                                        ここに図面が表示されます...
                                    </div>
                                </>
                            ) : (
                                <div>計算できませんでした</div>
                            )}
                        </div>
                    );
                }

                if (activeStep.id === "adjustment") {
                    const handleRealtimeUpdate = (field: keyof FormData, value: string) => {
                        updateField(field, value);

                        // 既存のタイマーをクリア
                        if (debounceTimer) {
                            clearTimeout(debounceTimer);
                        }

                        // 300ms後にシミュレーション実行
                        const timer = setTimeout(() => {
                            if (form.ownIncome && form.downPayment && value) {
                                runSimulation();
                            }
                        }, 300);

                        setDebounceTimer(timer);
                    };

                    return (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <Label htmlFor="adjust-monthly">月返済額（希望）</Label>
                                <div className="text-right text-sm text-muted-foreground mb-2">
                                    {parseFloat(form.wishMonthlyPayment) || 15}万円
                                </div>
                                <input
                                    type="range"
                                    min={5}
                                    max={50}
                                    step={1}
                                    value={parseFloat(form.wishMonthlyPayment) || 15}
                                    onChange={(e) => handleRealtimeUpdate("wishMonthlyPayment", e.target.value)}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>5万円</span>
                                    <span>50万円</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label htmlFor="adjust-years">返済期間（年）</Label>
                                <div className="text-right text-sm text-muted-foreground mb-2">
                                    {parseInt(form.wishPaymentYears) || 35}年
                                </div>
                                <input
                                    type="range"
                                    min={10}
                                    max={35}
                                    step={1}
                                    value={parseInt(form.wishPaymentYears) || 35}
                                    onChange={(e) => handleRealtimeUpdate("wishPaymentYears", e.target.value)}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>10年</span>
                                    <span>35年</span>
                                </div>
                            </div>

                            {loading ? (
                                <div className="mt-6 p-6 bg-muted/50 rounded-lg text-center">
                                    <div className="text-muted-foreground">計算中...</div>
                                </div>
                            ) : simulation ? (
                                <div className="mt-6 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                                    <div className="text-center space-y-4">
                                        {/* 借入額を強調 */}
                                        <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">借入可能額</div>
                                            <div className="text-4xl font-bold text-primary">
                                                {Math.round(simulation.wishLoanAmount).toLocaleString()}万円
                                            </div>
                                        </div>

                                        {/* 坪数目安 */}
                                        <div className="border-t border-primary/10 pt-4">
                                            <div className="text-sm text-muted-foreground mb-1">建物面積の目安</div>
                                            <div className="text-2xl font-semibold text-primary">
                                                約{Math.round(simulation.estimatedTsubo)}坪
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                （約{Math.round(simulation.estimatedSquareMeters)}㎡）
                                            </div>
                                        </div>

                                        {/* 総予算 */}
                                        <div className="text-sm text-muted-foreground">
                                            総予算: {Math.round(simulation.totalBudget).toLocaleString()}万円
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-6 p-6 bg-muted/50 rounded-lg text-center">
                                    <div className="text-muted-foreground">計算結果を取得できませんでした</div>
                                </div>
                            )}
                        </div>
                    );
                }

                if (activeStep.id === "complete") {
                    return (
                        <div className="space-y-6 text-center">
                            <div className="text-6xl">✅</div>
                            <Button onClick={handleSave} className="w-full">
                                結果をメール送信
                            </Button>
                        </div>
                    );
                }

                return <div>表示画面</div>;

            default:
                return <div>不明な画面です</div>;
        }
    };

    const getButtonText = () => {
        if (activeStep.id === "complete") return "完了";
        if (activeStep.type === "display") return "次へ";
        return "次へ";
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="container mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl flex-1 flex flex-col justify-center p-4 sm:p-6 md:p-8">
                <div className="mb-4 sm:mb-6">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 text-center">
                        {currentStepIndex + 1} / {steps.length}
                    </p>
                </div>

                <Card className="flex-1 flex flex-col min-h-[350px] sm:min-h-[400px] md:min-h-[450px] bg-background/95 backdrop-blur">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={activeStep.id}
                            custom={direction}
                            variants={{
                                enter: (direction: number) => ({
                                    opacity: 0,
                                    x: direction === 1 ? 300 : -300  // 次へ=右から来る、戻る=左から来る
                                }),
                                center: {
                                    opacity: 1,
                                    x: 0
                                },
                                exit: (direction: number) => ({
                                    opacity: 0,
                                    x: direction === 1 ? -300 : 300  // 次へ=左に去る、戻る=右に去る
                                })
                            }}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                duration: 0.3,
                                ease: "easeInOut"
                            }}
                            className="flex h-full flex-col gap-4 sm:gap-6 p-4 sm:p-6 md:p-8"
                        >
                            <div className="space-y-2 text-center">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold leading-tight">
                                    {activeStep.title}
                                </h1>
                                {activeStep.description && (
                                    <p className="text-sm sm:text-base text-muted-foreground">
                                        {activeStep.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col justify-center">
                                <div className="w-full max-w-sm sm:max-w-md mx-auto">
                                    {renderField()}
                                </div>
                            </div>

                            {errors && (
                                <p className="text-sm sm:text-base font-medium text-destructive text-center px-4">
                                    {errors}
                                </p>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </Card>

                <div className="mt-4 sm:mt-6 flex justify-between gap-4">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentStepIndex === 0}
                        className="min-w-[80px] sm:min-w-[100px]"
                    >
                        戻る
                    </Button>
                    <Button
                        onClick={handleNext}
                        className="min-w-[80px] sm:min-w-[100px]"
                    >
                        {getButtonText()}
                    </Button>
                </div>
            </div>
        </div>
    );
}
