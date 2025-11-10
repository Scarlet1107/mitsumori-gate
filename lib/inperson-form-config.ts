/**
 * InPerson フォームの設定とステップ定義
 */

import type { InPersonFormData } from "@/lib/form-types";

// InPersonForm用のステップ設定
export interface InPersonFormStep {
    id: string;
    type: string;
    title?: string;
    description?: string;
    placeholder?: string;
    required?: boolean;
}

// ステップ定義（顧客検索機能を含む対面フォーム用）
export const inPersonFormSteps: InPersonFormStep[] = [
    {
        id: "search_name",
        type: "search",
        title: "お客様のお名前またはメールアドレスを入力してください",
        description: "既存のデータがある場合は自動で入力されます。下の候補からも選択できます。",
        placeholder: "例）山田太郎 または yamada@example.com",
        required: true,
    },
    {
        id: "name",
        type: "text",
        title: "お名前を確認してください",
        placeholder: "例）山田太郎",
        required: true,
    },
    {
        id: "phone",
        type: "tel",
        title: "電話番号を入力してください",
        placeholder: "例）090-1234-5678",
        required: true,
    },
    {
        id: "email",
        type: "email",
        title: "メールアドレスを入力してください",
        placeholder: "例）yamada@example.com",
        required: true,
    },
    {
        id: "age",
        type: "number",
        title: "年齢を入力してください",
        placeholder: "例）35",
        required: true,
    },
    {
        id: "postalCode",
        type: "postal_code",
        title: "郵便番号を入力してください",
        description: "物件所在地の郵便番号をハイフンなしで入力してください",
        placeholder: "1234567",
        required: true,
    },
    {
        id: "baseAddress",
        type: "text",
        title: "基本住所を確認してください",
        description: "郵便番号から自動入力された住所です（必要に応じて編集できます）",
        required: true,
    },
    {
        id: "detailAddress",
        type: "detail_address",
        title: "詳細住所を入力してください",
        description: "番地・建物名・部屋番号などを入力してください",
        placeholder: "例）1-2-3 マンション名 101号室",
        required: true,
    },
    {
        id: "ownIncome",
        type: "number",
        title: "あなたの年収を入力してください",
        placeholder: "例）600",
        required: true,
    },
    {
        id: "ownLoanPayment",
        type: "number",
        title: "現在の借入月額返済額を入力してください",
        description: "住宅ローン以外の借入（カードローン、自動車ローンなど）",
        placeholder: "例：3",
        required: true,
    },
    {
        id: "spouse_question",
        type: "question",
        title: "配偶者はいらっしゃいますか？"
    },
    {
        id: "spouseName",
        type: "text",
        title: "配偶者のお名前を入力してください",
        placeholder: "例）山田花子",
        required: true,
    },
    {
        id: "spouseIncome",
        type: "number",
        title: "配偶者の年収を入力してください",
        placeholder: "例）400",
        required: true,
    },
    {
        id: "spouseLoanPayment",
        type: "number",
        title: "配偶者の既存借入月額返済額を入力してください",
        description: "住宅ローン以外の借入（カードローン、自動車ローンなど）",
        placeholder: "例：5",
        required: true,
    },
    {
        id: "downPayment",
        type: "number",
        title: "頭金の金額を入力してください",
        placeholder: "例）500",
        required: true,
    },
    {
        id: "budget_display",
        type: "display",
        title: "あなたの上限予算（頭金＋借入上限額）"
    },
    {
        id: "wishMonthlyPayment",
        type: "number",
        title: "希望月額返済額を入力してください",
        placeholder: "例）12",
        required: true,
    },
    {
        id: "wishPaymentYears",
        type: "number",
        title: "希望返済年数を入力してください",
        placeholder: "例）35",
        required: true,
    },
    {
        id: "usesBonus",
        type: "question",
        title: "ボーナス払いを利用しますか？"
    },
    {
        id: "bonusPayment",
        type: "number",
        title: "ボーナス払い金額を入力してください",
        description: "6ヶ月に一回のボーナス払い金額（単位：万円）",
        placeholder: "例）50",
        required: true,
    },
    {
        id: "hasLand",
        type: "question",
        title: "土地をお持ちですか？"
    },
    {
        id: "usesTechnostructure",
        type: "question",
        title: "テクノストラクチャー工法をご希望ですか？"
    },
    {
        id: "loan_display",
        type: "display",
        title: "希望条件で借りられる金額"
    },
    {
        id: "floor_plan_display",
        type: "display",
        title: "希望条件で作れる図面のイメージ"
    },
    {
        id: "adjustment",
        type: "display",
        title: "条件を調整"
    },
    {
        id: "adjusted_plan_display",
        type: "display",
        title: "調整後の図面イメージ"
    },
    {
        id: "confirmation",
        type: "display",
        title: "入力内容の確認"
    }
];

// 顧客検索結果の型
export interface CustomerSearchResult {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    age?: string;
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
    downPayment?: string;
    wishMonthlyPayment?: string;
    wishPaymentYears?: string;
    bonusPayment?: string;
    usesBonus?: boolean | null;
    hasLand?: boolean | null;
    usesTechnostructure?: boolean | null;
}

// 初期フォームデータ
export const initialInPersonFormData: InPersonFormData = {
    // 顧客ID（検索で選択された場合）
    customerId: undefined,

    // 基本情報
    name: "",
    email: "",
    age: "",
    phone: "",

    // 住所情報
    postalCode: "",
    address: "",
    baseAddress: "",
    detailAddress: "",

    // 収入・支出情報
    ownIncome: "",
    ownLoanPayment: "",
    hasSpouse: null,
    spouseName: "",
    spouseIncome: "0",
    spouseLoanPayment: "0",

    // 希望条件
    downPayment: "",
    wishMonthlyPayment: "",
    wishPaymentYears: "",
    usesBonus: null,
    bonusPayment: "0",
    hasLand: null,
    usesTechnostructure: null,
    adjustment: ""
};
