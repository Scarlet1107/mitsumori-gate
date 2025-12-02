/**
 * フォーム共通の型定義とユーティリティ
 */

// 共通のステップタイプ
export type BaseStepType = "text" | "number" | "email" | "tel" | "display" | "question" | "consent";
export type WebStepType = BaseStepType;
export type InPersonStepType = BaseStepType | "search" | "detail_address";

// 基本ステップID（両フォーム共通）
export type CommonStepId =
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

// Web専用ステップID
export type WebStepId = CommonStepId;

// 対面専用ステップID
export type InPersonStepId = CommonStepId | "search_name" | "phone" | "address";

// ステップ設定の基本インターフェース
export interface BaseStepConfig<T extends string> {
    id: T;
    title: string;
    description?: string;
    placeholder?: string;
    required?: boolean;
}

// Web用ステップ設定
export interface WebStepConfig extends BaseStepConfig<WebStepId> {
    type?: WebStepType;
}

// 対面用ステップ設定
export interface InPersonStepConfig extends BaseStepConfig<InPersonStepId> {
    type?: InPersonStepType;
}

// 基本フォームデータ（両フォーム共通）
export interface BaseFormData {
    name: string;
    email: string;
    age: string;
    postalCode: string;
    address: string;
    ownIncome: string;
    ownLoanPayment: string;
    hasSpouse: boolean | null;
    spouseName: string;
    spouseIncome: string;
    spouseLoanPayment: string;
    downPayment: string;
    wishMonthlyPayment: string;
    wishPaymentYears: string;
    usesBonus: boolean | null;
    bonusPayment: string;
    hasLand: boolean | null;
    usesTechnostructure: boolean | null;
    adjustment: string;
    consentAccepted: boolean;
}

// Web用フォームデータ（BaseFormDataと同じ構造）
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WebFormData extends BaseFormData { }

// 対面用フォームデータ
export interface InPersonFormData extends BaseFormData {
    customerId?: string;
    phone: string;
    baseAddress: string;
    detailAddress: string;
}

// バリデーション結果
export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

// フィールドマッピング用の型
export interface FieldMapping<T extends Record<string, unknown>> {
    value: string;
    key: keyof T;
}

// 質問タイプのマッピング
export interface QuestionMapping<T extends Record<string, unknown>> {
    value: boolean | null;
    key: keyof T;
    trueLabel: string;
    falseLabel: string;
}

// ステップナビゲーション方向
export type NavigationDirection = 1 | -1;

// アニメーション設定
export const FORM_ANIMATIONS = {
    enter: (direction: NavigationDirection) => ({
        opacity: 0,
        x: direction === 1 ? 300 : -300
    }),
    center: {
        opacity: 1,
        x: 0
    },
    exit: (direction: NavigationDirection) => ({
        opacity: 0,
        x: direction === 1 ? -300 : 300
    }),
    transition: {
        duration: 0.3,
        ease: "easeInOut"
    }
} as const;

// 通貨フィールドかどうかの判定
const CURRENCY_FIELD_IDS = new Set([
    "own_income",
    "ownIncome",
    "own_loan_payment",
    "ownLoanPayment",
    "spouse_income",
    "spouseIncome",
    "spouse_loan_payment",
    "spouseLoanPayment",
    "down_payment",
    "downPayment",
    "wish_monthly",
    "wishMonthlyPayment",
    "bonus_payment",
    "bonusPayment"
]);

function normalizeStepId(stepId: string): string {
    return stepId.replace(/([A-Z])/g, "_$1").toLowerCase();
}

export function isCurrencyField(stepId: string): boolean {
    const normalized = normalizeStepId(stepId);
    return CURRENCY_FIELD_IDS.has(stepId) ||
        CURRENCY_FIELD_IDS.has(normalized) ||
        CURRENCY_FIELD_IDS.has(stepId.toLowerCase());
}

// 年齢フィールドかどうかの判定
export function isAgeField(stepId: string): boolean {
    return stepId === "age";
}

// 郵便番号フィールドかどうかの判定
export function isPostalCodeField(stepId: string): boolean {
    return stepId === "postal_code";
}

// 通貨単位の取得
export function getCurrencyUnit(stepId: string): string {
    if (isAgeField(stepId)) return "歳";
    if (isCurrencyField(stepId)) return "万円";
    return "";
}

// 進捗計算
export function calculateProgress(currentIndex: number, totalSteps: number): number {
    return ((currentIndex + 1) / totalSteps) * 100;
}

// ローカルストレージキーの生成
export function getProgressKey(formType: "web" | "inperson"): string {
    return `${formType}form-progress`;
}

export function getDataKey(formType: "web" | "inperson"): string {
    return `${formType}form-data`;
}
