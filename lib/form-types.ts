/**
 * フォーム共通の型定義とユーティリティ
 */

export type FormType = "web" | "inperson";

// 基本フォームデータ（両フォーム共通）
export interface BaseFormData {
    name: string;
    email: string;
    phone: string;
    age: string;
    spouseAge: string;
    postalCode: string;
    address: string;
    baseAddress: string;
    detailAddress: string;
    ownIncome: string;
    ownLoanPayment: string;
    hasSpouse: boolean | null;
    spouseName: string;
    spouseIncome: string;
    spouseLoanPayment: string;
    hasDownPayment: boolean | null;
    downPayment: string;
    wishMonthlyPayment: string;
    wishPaymentYears: string;
    usesBonus: boolean | null;
    bonusPayment: string;
    hasLand: boolean | null;
    hasExistingBuilding: boolean | null;
    hasLandBudget: boolean | null;
    landBudget: string;
    usesTechnostructure: boolean | null;
    usesAdditionalInsulation: boolean | null;
    adjustment: string;
    consentAccepted: boolean;
    allowNewEntry?: boolean;
}

// Web用フォームデータ（BaseFormDataと同じ構造）
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WebFormData extends BaseFormData { }

// 対面用フォームデータ
export interface InPersonFormData extends BaseFormData {
    customerId?: string;
}

// バリデーション結果
export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

// ステップナビゲーション方向
export type NavigationDirection = 1 | -1;

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

export function getHistoryKey(formType: "web" | "inperson"): string {
    return `${formType}form-history`;
}

export interface CustomerSearchResult {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    age?: string;
    spouseAge?: string;
    postalCode?: string;
    baseAddress?: string;
    detailAddress?: string;
    createdAt?: string;
    address?: string;
    hasSpouse?: boolean | null;
    spouseName?: string;
    ownIncome?: string;
    ownLoanPayment?: string;
    spouseIncome?: string;
    spouseLoanPayment?: string;
    hasDownPayment?: boolean | null;
    downPayment?: string;
    wishMonthlyPayment?: string;
    wishPaymentYears?: string;
    bonusPayment?: string;
    usesBonus?: boolean | null;
    hasLand?: boolean | null;
    hasExistingBuilding?: boolean | null;
    hasLandBudget?: boolean | null;
    landBudget?: string;
    usesTechnostructure?: boolean | null;
    usesAdditionalInsulation?: boolean | null;
    allowNewEntry?: boolean;
}
