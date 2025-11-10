/**
 * フォームバリデーション統一システム
 */

import { isValidPostalCode } from "@/lib/postal-address";
import type { ValidationResult, BaseFormData, InPersonFormData } from "@/lib/form-types";

const normalizeString = (value: unknown): string => {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return "";
    return String(value);
};

// バリデータ関数の型
type ValidatorFunction = (value: unknown, form?: BaseFormData) => ValidationResult;

// 基本バリデータ
export const validators = {
    // 必須入力
    required: (message: string = "入力してください"): ValidatorFunction => (value) => {
        const stringValue = normalizeString(value).trim();
        return {
            isValid: Boolean(stringValue),
            error: stringValue ? undefined : message
        };
    },

    // メールアドレス
    email: (): ValidatorFunction => (value) => {
        const stringValue = normalizeString(value).trim();
        if (!stringValue) {
            return { isValid: false, error: "メールアドレスを入力してください" };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(stringValue);

        return {
            isValid,
            error: isValid ? undefined : "有効なメールアドレスを入力してください"
        };
    },

    // 年齢
    age: (): ValidatorFunction => (value) => {
        const stringValue = normalizeString(value).trim();
        if (!stringValue) {
            return { isValid: false, error: "年齢を入力してください" };
        }
        const num = Number(stringValue);
        const isValid = !isNaN(num) && num >= 18 && num <= 100;
        return {
            isValid,
            error: isValid ? undefined : "18歳以上100歳以下で入力してください"
        };
    },

    // 郵便番号
    postalCode: (): ValidatorFunction => (value) => {
        const stringValue = normalizeString(value).trim();
        if (!stringValue) {
            return { isValid: false, error: "郵便番号を入力してください" };
        }

        const isValid = isValidPostalCode(stringValue);

        return {
            isValid,
            error: isValid ? undefined : "正しい郵便番号を入力してください（7桁の数字）"
        };
    },

    // 正の数値
    positiveNumber: (fieldName: string): ValidatorFunction => (value) => {
        const stringValue = normalizeString(value).trim();
        if (!stringValue) {
            return { isValid: false, error: `${fieldName}を入力してください` };
        }
        const num = Number(stringValue);
        const isValid = !isNaN(num) && num > 0;
        return {
            isValid,
            error: isValid ? undefined : `${fieldName}は0より大きい数値を入力してください`
        };
    },

    // 0以上の数値（頭金用）
    nonNegativeNumber: (fieldName: string): ValidatorFunction => (value) => {
        const stringValue = normalizeString(value).trim();
        if (!stringValue) {
            return { isValid: false, error: `${fieldName}を入力してください` };
        }
        const num = Number(stringValue);
        const isValid = !isNaN(num) && num >= 0;
        return {
            isValid,
            error: isValid ? undefined : `${fieldName}は0以上の数値を入力してください`
        };
    },

    // ブール値必須
    booleanRequired: (message: string): ValidatorFunction => (value) => {
        const booleanValue = value as boolean | null;
        return {
            isValid: booleanValue !== null && booleanValue !== undefined,
            error: (booleanValue !== null && booleanValue !== undefined) ? undefined : message
        };
    },
};

// ステップ別バリデーション設定
export const stepValidators: Record<string, ValidatorFunction> = {
    // 基本情報
    name: validators.required("お名前を入力してください"),
    email: validators.email(),
    age: validators.age(),
    phone: validators.required("電話番号を入力してください"),
    postal_code: validators.postalCode(),
    address: validators.required("詳細住所を入力してください（番地・建物名など）"),

    // 収入・支出
    ownIncome: validators.positiveNumber("年収"),
    ownLoanPayment: validators.nonNegativeNumber("借入返済額"),
    spouseName: (value: unknown, form?: BaseFormData) => {
        if (!form?.hasSpouse) return { isValid: true };
        const stringValue = normalizeString(value).trim();
        return stringValue ? { isValid: true } : { isValid: false, error: "配偶者のお名前を入力してください" };
    },
    spouseIncome: (value: unknown, form?: BaseFormData) => {
        if (!form?.hasSpouse) return { isValid: true };
        return validators.nonNegativeNumber("配偶者の年収")(value, form);
    },
    spouseLoanPayment: (value: unknown, form?: BaseFormData) => {
        if (!form?.hasSpouse) return { isValid: true };
        return validators.nonNegativeNumber("配偶者の借入返済額")(value, form);
    },
    downPayment: validators.nonNegativeNumber("頭金"),
    wishMonthlyPayment: validators.positiveNumber("希望月返済額"),
    wishPaymentYears: validators.positiveNumber("希望返済期間"),

    // 選択項目
    spouse_question: validators.booleanRequired("配偶者の有無を選択してください"),
    usesBonus: validators.booleanRequired("ボーナス返済の利用を選択してください"),
    bonusPayment: (value: unknown, form?: BaseFormData) => {
        if (!form?.usesBonus) return { isValid: true };
        return validators.nonNegativeNumber("ボーナス支払い金額")(value, form);
    },
    hasLand: validators.booleanRequired("土地の有無を選択してください"),
    usesTechnostructure: validators.booleanRequired("テクノストラクチャーの利用を選択してください"),

    // 対面専用
    search_name: validators.required("お名前を入力してください"),
};

// フォーム全体のバリデーション
export function validateStep<T extends BaseFormData | InPersonFormData>(
    stepId: string,
    form: T
): ValidationResult {
    const validator = stepValidators[stepId];

    if (!validator) {
        // バリデータが定義されていない場合は有効とする（displayステップなど）
        return { isValid: true };
    }

    // ステップIDをキーとしてフォームから値を取得
    const fieldKey = getFieldKeyFromStepId(stepId);
    const value = fieldKey ? form[fieldKey as keyof T] : undefined;

    return validator(value, form);
}

// ステップIDからフォームフィールドキーへの変換
function getFieldKeyFromStepId(stepId: string): string | null {
    const mapping: Record<string, string> = {
        // 対面フォーム専用
        search_name: "name",
        postal_code: "postalCode",
        address: "detailAddress", // 対面フォームの場合

        // 共通フィールド（既にキャメルケースの場合はそのまま使用）
        spouse_question: "hasSpouse",
    };

    // マッピングにない場合はそのまま返す（多くのフィールドは既に正しいキャメルケース）
    return mapping[stepId] || stepId;
}

// 複数ステップの一括バリデーション
export function validateForm<T extends BaseFormData | InPersonFormData>(
    stepIds: string[],
    form: T
): ValidationResult {
    for (const stepId of stepIds) {
        const result = validateStep(stepId, form);
        if (!result.isValid) {
            return result;
        }
    }
    return { isValid: true };
}

// バリデーションエラーメッセージのフォーマット
export function formatValidationError(error: string): string {
    return error;
}

// カスタムバリデーションルールの追加
export function addCustomValidator(stepId: string, validator: ValidatorFunction): void {
    stepValidators[stepId] = validator;
}
