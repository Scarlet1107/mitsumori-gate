import type { BaseFormData, InPersonFormData, ValidationResult, FormType } from "@/lib/form-types";

export type FormStepType =
    | "text"
    | "number"
    | "email"
    | "tel"
    | "display"
    | "question"
    | "consent"
    | "search"
    | "postal_code"
    | "detail_address";

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

export const formSteps: FormStep[] = [
    {
        id: "search_name",
        type: "search",
        title: "お客様のお名前またはメールアドレスを入力してください",
        description: "既存のデータがある場合は自動で入力されます。下の候補からも選択できます。",
        placeholder: "例）山田太郎 または yamada@example.com",
        inPersonOnly: true,
    },
    {
        id: "consent",
        type: "consent",
        title: "個人情報の取り扱いについて",
        description: "入力内容の取り扱いに同意いただいた上で進めてください。",
        inPersonOnly: true,
        field: "consentAccepted",
        validate: (form) => {
            return form.consentAccepted
                ? { isValid: true }
                : { isValid: false, error: "個人情報保護への同意が必要です" };
        },
    },
    {
        id: "name",
        type: "text",
        title: "お名前を教えてください",
        placeholder: "例）山田太郎",
        field: "name",
        validate: (form) => requireText(form.name, "お名前を入力してください"),
    },
    {
        id: "phone",
        type: "tel",
        title: "電話番号を入力してください",
        placeholder: "例）090-1234-5678",
        inPersonOnly: true,
        field: "phone",
        validate: (form) => requireText(form.phone, "電話番号を入力してください"),
    },
    {
        id: "email",
        type: "email",
        title: "メールアドレスを入力してください",
        placeholder: "例）yamada@example.com",
        field: "email",
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
        validate: (form) => requireNumber(form.age, "年齢を入力してください", 18),
    },
    {
        id: "postalCode",
        type: "postal_code",
        title: "郵便番号を入力してください",
        description: "物件所在地の郵便番号をハイフンなしで入力してください",
        placeholder: "1234567",
        inPersonOnly: true,
        field: "postalCode",
        validate: (form) => requireText(form.postalCode, "郵便番号を入力してください"),
    },
    {
        id: "baseAddress",
        type: "text",
        title: "基本住所を確認してください",
        description: "郵便番号から自動入力された住所です（必要に応じて編集できます）",
        inPersonOnly: true,
        field: "baseAddress",
        validate: (form) => requireText(form.baseAddress, "基本住所を確認してください"),
    },
    {
        id: "detailAddress",
        type: "detail_address",
        title: "詳細住所を入力してください",
        description: "番地・建物名・部屋番号などを入力してください",
        placeholder: "例）1-2-3 マンション名 101号室",
        inPersonOnly: true,
        field: "detailAddress",
        validate: (form) => requireText(form.detailAddress, "詳細住所を入力してください"),
    },
    {
        id: "ownIncome",
        type: "number",
        title: "ご自身の年収を教えてください",
        description: "単位：万円",
        placeholder: "例）600",
        unit: "万円",
        field: "ownIncome",
        validate: (form) => requirePositiveNumber(form.ownIncome, "年収を入力してください"),
    },
    {
        id: "ownLoanPayment",
        type: "number",
        title: "ご自身の毎月の借り入れ返済額を入力してください",
        description: "単位：万円",
        placeholder: "例）5",
        unit: "万円",
        field: "ownLoanPayment",
        validate: (form) => requireNumber(form.ownLoanPayment, "借入返済額を入力してください（0以上）", 0),
    },
    {
        id: "spouse_question",
        type: "question",
        title: "配偶者はいらっしゃいますか？",
        field: "hasSpouse",
        onAnswer: (form, answer) => {
            if (answer) {
                return {};
            }
            return {
                spouseName: "",
                spouseAge: "",
                spouseIncome: "0",
                spouseLoanPayment: "0",
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
        isSkippable: (form) => form.hasSpouse !== true,
        validate: (form) => requireNumber(form.spouseLoanPayment, "配偶者の借入返済額を入力してください（0以上）", 0),
    },
    {
        id: "downPayment",
        type: "number",
        title: "頭金を入力してください",
        description: "単位：万円",
        placeholder: "例）500",
        unit: "万円",
        field: "downPayment",
        validate: (form) => requireNumber(form.downPayment, "頭金を入力してください（0以上）", 0),
    },
    {
        id: "budget_display",
        type: "display",
        title: "あなたの上限予算",
        description: "頭金＋借入上限額",
    },
    {
        id: "wishMonthlyPayment",
        type: "number",
        title: "希望返済月額を入力してください",
        description: "単位：万円",
        placeholder: "例）12",
        unit: "万円",
        field: "wishMonthlyPayment",
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
        validate: (form) => requireNumber(form.wishPaymentYears, "希望返済年数を入力してください", 1),
    },
    {
        id: "usesBonus",
        type: "question",
        title: "ボーナス払いを利用しますか？",
        field: "usesBonus",
        nextByAnswer: {
            true: "bonusPayment",
            false: "hasLand",
        },
        onAnswer: (form, answer) => {
            if (answer) {
                return {};
            }
            return { bonusPayment: "0" };
        },
    },
    {
        id: "bonusPayment",
        type: "number",
        title: "ボーナス払い金額を入力してください",
        description: "6ヶ月に一回のボーナス払い金額（単位：万円）",
        placeholder: "例）50",
        unit: "万円",
        field: "bonusPayment",
        isSkippable: (form) => form.usesBonus !== true,
        validate: (form) => requireNumber(form.bonusPayment, "ボーナス支払い金額を入力してください（0以上）", 0),
    },
    {
        id: "hasLand",
        type: "question",
        title: "土地をお持ちですか？",
        field: "hasLand",
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
        isSkippable: (form) => form.hasLand !== true,
    },
    {
        id: "hasLandBudget",
        type: "question",
        title: "土地の予算は決めていますか？",
        field: "hasLandBudget",
        isSkippable: (form) => form.hasLand !== false,
        nextByAnswer: {
            true: "landBudget",
            false: "usesTechnostructure",
        },
        onAnswer: (form, answer) => {
            if (answer) {
                return {};
            }
            return { landBudget: "0" };
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
        isSkippable: (form) => form.hasLand !== false || form.hasLandBudget !== true,
        validate: (form) => requireNumber(form.landBudget, "土地の予算を入力してください（0以上）", 0),
    },
    {
        id: "usesTechnostructure",
        type: "question",
        title: "テクノストラクチャー工法をご希望ですか？",
        field: "usesTechnostructure",
    },
    {
        id: "loan_display",
        type: "display",
        title: "ローンシミュレーション結果",
        description: "希望条件の調整ができます",
    },
    {
        id: "confirmation",
        type: "display",
        title: "入力内容の確認",
        inPersonOnly: true,
    },
    {
        id: "complete",
        type: "display",
        title: "完了",
        webOnly: true,
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
    spouseIncome: "0",
    spouseLoanPayment: "0",
    downPayment: "",
    wishMonthlyPayment: "",
    wishPaymentYears: "",
    usesBonus: null,
    bonusPayment: "0",
    hasLand: null,
    hasExistingBuilding: null,
    hasLandBudget: null,
    landBudget: "0",
    usesTechnostructure: null,
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
    if (step.type === "display" || step.type === "search") {
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
