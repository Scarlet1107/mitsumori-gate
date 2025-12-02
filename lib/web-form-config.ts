/**
 * Web フォームの設定とステップ定義
 */

import type { WebFormData } from "@/lib/form-types";

// WebForm用のステップ設定
export interface WebFormStep {
    id: string;
    type: string;
    title?: string;
    description?: string;
    placeholder?: string;
    required?: boolean;
    unit?: string;
}

// ステップ定義
export const webFormSteps: WebFormStep[] = [
    {
        id: "name",
        type: "text",
        title: "お名前を教えてください",
        placeholder: "例）山田太郎",
        required: true
    },
    {
        id: "email",
        type: "email",
        title: "メールアドレスを入力してください",
        placeholder: "例）yamada@example.com",
        required: true
    },
    {
        id: "age",
        type: "number",
        title: "年齢を教えてください",
        description: "完済時年齢の目安を計算するために使用します",
        placeholder: "例）35",
        required: true,
        unit: "歳"
    },
    {
        id: "ownIncome",
        type: "number",
        title: "ご自身の年収を教えてください",
        description: "単位：万円",
        placeholder: "例）600",
        required: true,
        unit: "万円"
    },
    {
        id: "ownLoanPayment",
        type: "number",
        title: "ご自身の毎月の借り入れ返済額を入力してください",
        description: "単位：万円",
        placeholder: "例）5",
        required: true,
        unit: "万円"
    },
    {
        id: "spouse_question",
        type: "question",
        title: "配偶者はいらっしゃいますか？"
    },
    {
        id: "spouseIncome",
        type: "number",
        title: "配偶者の年収を教えてください",
        description: "単位：万円",
        placeholder: "例）400",
        required: true,
        unit: "万円"
    },
    {
        id: "spouseLoanPayment",
        type: "number",
        title: "配偶者の毎月の借り入れ返済額を入力してください",
        description: "単位：万円",
        placeholder: "例）3",
        required: true,
        unit: "万円"
    },
    {
        id: "downPayment",
        type: "number",
        title: "頭金を入力してください",
        description: "単位：万円",
        placeholder: "例）500",
        required: true,
        unit: "万円"
    },
    {
        id: "budget_display",
        type: "display",
        title: "あなたの上限予算",
        description: "頭金＋借入上限額"
    },
    {
        id: "wishMonthlyPayment",
        type: "number",
        title: "希望月額返済額を入力してください",
        description: "単位：万円",
        placeholder: "例）12",
        required: true,
        unit: "万円"
    },
    {
        id: "wishPaymentYears",
        type: "number",
        title: "希望返済年数を入力してください",
        description: "単位：年",
        placeholder: "例）35",
        required: true,
        unit: "年"
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
        unit: "万円"
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
        title: "ローンシミュレーション結果",
        description: "スライダーで条件を調整して、リアルタイムで結果を確認できます"
    },
    {
        id: "complete",
        type: "display",
        title: "完了"
    }
];

// 雇用形態の選択肢
export const employmentTypeOptions = [
    { value: "正社員", label: "正社員" },
    { value: "契約社員", label: "契約社員" },
    { value: "派遣社員", label: "派遣社員" },
    { value: "パート・アルバイト", label: "パート・アルバイト" },
    { value: "自営業", label: "自営業" },
    { value: "公務員", label: "公務員" },
    { value: "その他", label: "その他" }
];

// 連絡時間の選択肢
export const contactTimeOptions = [
    { value: "9-12", label: "9:00〜12:00" },
    { value: "12-15", label: "12:00〜15:00" },
    { value: "15-18", label: "15:00〜18:00" },
    { value: "18-21", label: "18:00〜21:00" },
    { value: "anytime", label: "いつでも" }
];

// 相談方法の選択肢  
export const consultationMethodOptions = [
    { value: "phone", label: "電話での相談" },
    { value: "email", label: "メールでの相談" },
    { value: "visit", label: "店舗での相談" },
    { value: "online", label: "オンライン相談" }
];

// 初期フォームデータ
export const initialWebFormData: WebFormData = {
    // 基本情報
    name: "",
    email: "",
    age: "",
    postalCode: "",  // 対面フォームとの互換性のため残す（空文字）
    address: "",     // 対面フォームとの互換性のため残す（空文字）
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
    usesTechnostructure: null,
    adjustment: "",
    consentAccepted: false
};
