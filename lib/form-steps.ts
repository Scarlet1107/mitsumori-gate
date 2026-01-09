import type { BaseFormData, InPersonFormData, ValidationResult, FormType } from "@/lib/form-types";
import { isValidPhoneNumber, normalizePhoneNumber } from "@/lib/phone";

export type FormStepType =
    | "text"
    | "number"
    | "email"
    | "tel"
    | "display"
    | "question"
    | "consent"
    | "postal_code";

export interface FormStep {
    id: string;
    type: FormStepType;
    title?: string;
    description?: string;
    placeholder?: string;
    unit?: string;
    webOnly?: boolean;
    inPersonOnly?: boolean;
    field?: string;
    phase?: number;
    displayVariant?: "phase_intro";
    nextByAnswer?: {
        true?: string;
        false?: string;
    };
    isSkippable?: (form: BaseFormData) => boolean;
    validate?: (form: BaseFormData) => ValidationResult;
    onAnswer?: (form: BaseFormData, answer: boolean) => Partial<BaseFormData>;
}

const requireText = (value: string, message: string): ValidationResult => {
    return value.trim() ? { isValid: true } : { isValid: false, error: message };
};

const requirePhoneNumber = (value: string): ValidationResult => {
    const digits = normalizePhoneNumber(value);
    if (!digits) {
        return { isValid: false, error: "電話番号を入力してください" };
    }
    return isValidPhoneNumber(digits)
        ? { isValid: true }
        : { isValid: false, error: "電話番号は数字のみで10〜11桁で入力してください" };
};

const requireNumber = (value: string, message: string, min = 0): ValidationResult => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return { isValid: false, error: message };
    }
    return parsed >= min ? { isValid: true } : { isValid: false, error: message };
};

const requirePositiveNumber = (value: string, message: string): ValidationResult => {
    return requireNumber(value, message, 0.01);
};

const allowEmptyNumber = (value: string, message: string, min = 0): ValidationResult => {
    if (!value.trim()) {
        return { isValid: true };
    }
    return requireNumber(value, message, min);
};
export const formPhases = [
    {
        id: 1,
        label: "STEP1",
        title: "住宅ローンの借入可能額を算出します",
    },
    {
        id: 2,
        label: "STEP2",
        title: "希望される返済額から予算の上限を見てみましょう",
    },
    {
        id: 3,
        label: "STEP3",
        title: "ご予算に合ったプランシミュレーションを見てみましょう",
    },
] as const;

export function getPhaseLabel(phase?: number): string | undefined {
    if (!phase) return undefined;
    return formPhases.find((item) => item.id === phase)?.label;
}

const createPhaseIntroStep = (phaseId: number): FormStep => {
    const phase = formPhases.find((item) => item.id === phaseId);
    return {
        id: `phase_${phaseId}_intro`,
        type: "display",
        title: phase?.title,
        phase: phaseId,
        displayVariant: "phase_intro",
    };
};

export const formSteps: FormStep[] = [
    {
        id: "consent",
        type: "consent",
        title: "個人情報の取り扱いについて",
        description: "入力内容の取り扱いに同意いただいた上で進めてください。",
        inPersonOnly: true,
        field: "consentAccepted",
        phase: 1,
        isSkippable: (form) => form.consentAccepted === true,
        validate: (form) => {
            return form.consentAccepted
                ? { isValid: true }
                : { isValid: false, error: "個人情報保護への同意が必要です" };
        },
    },
    createPhaseIntroStep(1),
    {
        id: "name",
        type: "text",
        title: "お名前を教えてください",
        placeholder: "例）山田太郎",
        field: "name",
        phase: 1,
        validate: (form) => requireText(form.name, "お名前を入力してください"),
    },
    {
        id: "phone",
        type: "tel",
        title: "電話番号を入力してください",
        placeholder: "例）09012345678",
        inPersonOnly: true,
        field: "phone",
        phase: 1,
        validate: (form) => requirePhoneNumber(form.phone),
    },
    {
        id: "email",
        type: "email",
        title: "メールアドレスを入力してください",
        placeholder: "例）yamada@example.com",
        field: "email",
        phase: 1,
        validate: (form) => {
            const value = form.email.trim();
            if (!value) {
                return { isValid: false, error: "メールアドレスを入力してください" };
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value)
                ? { isValid: true }
                : { isValid: false, error: "有効なメールアドレスを入力してください" };
        },
    },
    {
        id: "age",
        type: "number",
        title: "年齢を教えてください",
        description: "完済時年齢の目安を計算するために使用します",
        placeholder: "例）35",
        unit: "歳",
        field: "age",
        phase: 1,
        validate: (form) => requireNumber(form.age, "年齢を入力してください", 18),
    },
    {
        id: "postalCode",
        type: "postal_code",
        title: "現住所の郵便番号を入力してください",
        placeholder: "1234567",
        inPersonOnly: true,
        field: "postalCode",
        phase: 1,
        validate: (form) => requireText(form.postalCode, "郵便番号を入力してください"),
    },
    {
        id: "baseAddress",
        type: "text",
        title: "住所を入力してください",
        description: "アパート名や部屋番号までご入力ください。",
        inPersonOnly: true,
        field: "baseAddress",
        phase: 1,
        validate: (form) => requireText(form.baseAddress, "住所を入力してください"),
    },
    {
        id: "ownIncome",
        type: "number",
        title: "ご自身の年収を教えてください",
        description: "単位：万円",
        placeholder: "例）600",
        unit: "万円",
        field: "ownIncome",
        phase: 1,
        validate: (form) => requirePositiveNumber(form.ownIncome, "年収を入力してください"),
    },
    {
        id: "ownLoanPayment",
        type: "number",
        title: "現在返済中のローンの月々返済額を入力してください",
        description: "例：自動車ローン、教育ローンなど（単位：万円）",
        placeholder: "例）5",
        unit: "万円",
        field: "ownLoanPayment",
        phase: 1,
        validate: (form) => allowEmptyNumber(form.ownLoanPayment, "借入返済額を入力してください（0以上）", 0),
    },
    {
        id: "spouse_question",
        type: "question",
        title: "配偶者はいらっしゃいますか？",
        field: "hasSpouse",
        phase: 1,
        onAnswer: (form, answer) => {
            if (answer) {
                return {};
            }
            return {
                spouseName: "",
                spouseAge: "",
                spouseIncome: "",
                spouseLoanPayment: "",
            };
        },
    },
    {
        id: "spouseName",
        type: "text",
        title: "配偶者のお名前を入力してください",
        placeholder: "例）山田花子",
        inPersonOnly: true,
        field: "spouseName",
        phase: 1,
        isSkippable: (form) => form.hasSpouse !== true,
        validate: (form) => requireText(form.spouseName, "配偶者のお名前を入力してください"),
    },
    {
        id: "spouseAge",
        type: "number",
        title: "配偶者の年齢を教えてください",
        placeholder: "例）33",
        unit: "歳",
        field: "spouseAge",
        phase: 1,
        isSkippable: (form) => form.hasSpouse !== true,
        validate: (form) => requireNumber(form.spouseAge, "配偶者の年齢を入力してください", 18),
    },
    {
        id: "spouseIncome",
        type: "number",
        title: "配偶者の年収を教えてください",
        description: "単位：万円",
        placeholder: "例）400",
        unit: "万円",
        field: "spouseIncome",
        phase: 1,
        isSkippable: (form) => form.hasSpouse !== true,
        validate: (form) => requireNumber(form.spouseIncome, "配偶者の年収を入力してください（0以上）", 0),
    },
    {
        id: "spouseLoanPayment",
        type: "number",
        title: "配偶者の毎月の借り入れ返済額を入力してください",
        description: "単位：万円",
        placeholder: "例）3",
        unit: "万円",
        field: "spouseLoanPayment",
        phase: 1,
        isSkippable: (form) => form.hasSpouse !== true,
        validate: (form) => allowEmptyNumber(form.spouseLoanPayment, "配偶者の借入返済額を入力してください（0以上）", 0),
    },
    {
        id: "hasDownPayment",
        type: "question",
        title: "自己資金（頭金）を準備される予定はありますか？",
        field: "hasDownPayment",
        phase: 1,
        nextByAnswer: {
            true: "downPayment",
            false: "budget_display",
        },
        onAnswer: (form, answer) => {
            if (answer) {
                return { downPayment: "" };
            }
            return { downPayment: "0" };
        },
    },
    {
        id: "downPayment",
        type: "number",
        title: "自己資金（頭金）を入力してください",
        description: "単位：万円",
        placeholder: "例）500",
        unit: "万円",
        field: "downPayment",
        phase: 1,
        validate: (form) => allowEmptyNumber(form.downPayment, "自己資金を入力してください（0以上）", 0),
    },
    {
        id: "budget_display",
        type: "display",
        title: "あなたの上限予算",
        description: "自己資金＋借入上限額",
        phase: 1,
    },
    createPhaseIntroStep(2),
    {
        id: "wishMonthlyPayment",
        type: "number",
        title: "希望返済月額を入力してください",
        description: "単位：万円",
        placeholder: "例）12",
        unit: "万円",
        field: "wishMonthlyPayment",
        phase: 2,
        validate: (form) => requirePositiveNumber(form.wishMonthlyPayment, "希望返済月額を入力してください"),
    },
    {
        id: "wishPaymentYears",
        type: "number",
        title: "希望返済年数を入力してください",
        description: "単位：年",
        placeholder: "例）35",
        unit: "年",
        field: "wishPaymentYears",
        phase: 2,
        validate: (form) => requireNumber(form.wishPaymentYears, "希望返済年数を入力してください", 1),
    },
    {
        id: "usesBonus",
        type: "question",
        title: "ボーナス払いを利用しますか？",
        field: "usesBonus",
        phase: 2,
        nextByAnswer: {
            true: "bonusPayment",
            false: "hasLand",
        },
        onAnswer: (form, answer) => {
            return answer ? { bonusPayment: "" } : { bonusPayment: "0" };
        },
    },
    {
        id: "bonusPayment",
        type: "number",
        title: "ボーナス払い金額を入力してください",
        description: "一回あたりのボーナス支払い額（単位：万円）",
        placeholder: "例）50",
        unit: "万円",
        field: "bonusPayment",
        phase: 2,
        isSkippable: (form) => form.usesBonus !== true,
        validate: (form) => allowEmptyNumber(form.bonusPayment, "ボーナス支払い金額を入力してください（0以上）", 0),
    },
    {
        id: "hasLand",
        type: "question",
        title: "土地をお持ちですか？",
        field: "hasLand",
        phase: 2,
        nextByAnswer: {
            true: "hasExistingBuilding",
            false: "hasLandBudget",
        },
        onAnswer: (form, answer) => {
            if (answer) {
                return {
                    hasLandBudget: null,
                    landBudget: "0",
                };
            }
            return {
                hasExistingBuilding: null,
            };
        },
    },
    {
        id: "hasExistingBuilding",
        type: "question",
        title: "既存建築物はありますか？",
        field: "hasExistingBuilding",
        phase: 2,
        isSkippable: (form) => form.hasLand !== true,
    },
    {
        id: "hasLandBudget",
        type: "question",
        title: "土地の予算は決めていますか？",
        field: "hasLandBudget",
        phase: 2,
        isSkippable: (form) => form.hasLand !== false,
        nextByAnswer: {
            true: "landBudget",
            false: "usesTechnostructure",
        },
        onAnswer: (form, answer) => {
            return answer ? { landBudget: "" } : { landBudget: "0" };
        },
    },
    {
        id: "landBudget",
        type: "number",
        title: "土地の予算を入力してください",
        description: "単位：万円",
        placeholder: "例）1000",
        unit: "万円",
        field: "landBudget",
        phase: 2,
        isSkippable: (form) => form.hasLand !== false || form.hasLandBudget !== true,
        validate: (form) => allowEmptyNumber(form.landBudget, "土地の予算を入力してください（0以上）", 0),
    },
    {
        id: "usesTechnostructure",
        type: "question",
        title: "テクノストラクチャー工法をご希望ですか？",
        field: "usesTechnostructure",
        phase: 2,
    },
    {
        id: "usesAdditionalInsulation",
        type: "question",
        title: "付加断熱工法を採用しますか？",
        field: "usesAdditionalInsulation",
        phase: 2,
    },
    createPhaseIntroStep(3),
    {
        id: "loan_display",
        type: "display",
        title: "ローンシミュレーション結果",
        description: "希望条件の調整ができます",
        phase: 3,
    },
    {
        id: "confirmation",
        type: "display",
        title: "入力内容の確認",
        inPersonOnly: true,
        phase: 3,
    },
    {
        id: "complete",
        type: "display",
        title: "完了",
        webOnly: true,
        phase: 3,
    },
];

export const initialWebFormData: BaseFormData = {
    name: "",
    email: "",
    phone: "",
    age: "",
    spouseAge: "",
    postalCode: "",
    address: "",
    baseAddress: "",
    detailAddress: "",
    ownIncome: "",
    ownLoanPayment: "",
    hasSpouse: null,
    spouseName: "",
    spouseIncome: "",
    spouseLoanPayment: "",
    hasDownPayment: null,
    downPayment: "",
    wishMonthlyPayment: "",
    wishPaymentYears: "",
    usesBonus: null,
    bonusPayment: "",
    hasLand: null,
    hasExistingBuilding: null,
    hasLandBudget: null,
    landBudget: "",
    usesTechnostructure: null,
    usesAdditionalInsulation: null,
    adjustment: "",
    consentAccepted: false,
};

export const initialInPersonFormData: InPersonFormData = {
    ...initialWebFormData,
    customerId: undefined,
    allowNewEntry: false,
};

export function getFormSteps(
    formType: FormType,
    form: BaseFormData,
    steps: FormStep[] = formSteps
): FormStep[] {
    return steps.filter((step) => isStepAvailable(formType, form, step));
}

export function validateStep(step: FormStep, form: BaseFormData): ValidationResult {
    if (step.type === "display") {
        return { isValid: true };
    }
    if (step.type === "question") {
        const field = step.field;
        if (!field) return { isValid: true };
        const value = form[field as keyof BaseFormData];
        return typeof value === "boolean"
            ? { isValid: true }
            : { isValid: false, error: "選択してください" };
    }
    if (step.validate) {
        return step.validate(form);
    }
    if (step.field) {
        const value = form[step.field as keyof BaseFormData];
        if (typeof value === "string") {
            return requireText(value, "入力してください");
        }
    }
    return { isValid: true };
}

export function isStepAvailable(
    formType: FormType,
    form: BaseFormData,
    step: FormStep
): boolean {
    if (formType === "web" && step.inPersonOnly) return false;
    if (formType === "inperson" && step.webOnly) return false;
    if (step.isSkippable && step.isSkippable(form)) return false;
    return true;
}
