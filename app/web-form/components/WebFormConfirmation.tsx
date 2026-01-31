/**
 * WebFormConfirmation - 入力内容確認コンポーネント
 */

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatManWithOku } from "@/lib/format";
import type { WebFormData } from "@/lib/form-types";

interface WebFormConfirmationProps {
    form: WebFormData;
}

/**
 * フォーム送信前の入力内容確認画面
 */
export function WebFormConfirmation({ form }: WebFormConfirmationProps) {
    const formatYesNo = (value: boolean | null) => {
        if (value === null) return "未選択";
        return value ? "はい" : "いいえ";
    };

    const formatCurrency = (value: string) => {
        const num = Number(value || 0);
        if (!Number.isFinite(num)) return value;
        return formatManWithOku(num);
    };

    return (
        <div className="space-y-6">
            {/* 基本情報 */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">基本情報</h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">お名前</span>
                        <span>{form.name || "未入力"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">メールアドレス</span>
                        <span>{form.email || "未入力"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">年齢</span>
                        <span>{form.age ? `${form.age}歳` : "未入力"}</span>
                    </div>
                </div>
            </Card>

            {/* 収入・支出情報 */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">収入・支出情報</h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">あなたの年収</span>
                        <span>{formatCurrency(form.ownIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">あなたの既存借入返済額</span>
                        <span>{formatCurrency(form.ownLoanPayment)}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between">
                        <span className="text-gray-600">配偶者の有無</span>
                        <span>{formatYesNo(form.hasSpouse)}</span>
                    </div>
                    {form.hasSpouse && (
                        <>
                            <div className="flex justify-between">
                                <span className="text-gray-600">配偶者の年齢</span>
                                <span>{form.spouseAge ? `${form.spouseAge}歳` : "未入力"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">配偶者の年収</span>
                                <span>{formatCurrency(form.spouseIncome)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">配偶者の既存借入返済額</span>
                                <span>{formatCurrency(form.spouseLoanPayment)}</span>
                            </div>
                        </>
                    )}
                </div>
            </Card>

            {/* 住宅ローン希望条件 */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">住宅ローン希望条件</h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">自己資金</span>
                        <span>{formatCurrency(form.downPayment)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">希望返済月額</span>
                        <span>{formatCurrency(form.wishMonthlyPayment)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">希望返済年数</span>
                        <span>{form.wishPaymentYears ? `${form.wishPaymentYears}年` : "未入力"}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between">
                        <span className="text-gray-600">ボーナス払い利用</span>
                        <span>{formatYesNo(form.usesBonus)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">土地の所有</span>
                        <span>{formatYesNo(form.hasLand)}</span>
                    </div>
                    {form.hasLand === true && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">既存建築物</span>
                            <span>{formatYesNo(form.hasExistingBuilding)}</span>
                        </div>
                    )}
                    {form.hasLand === false && (
                        <>
                            <div className="flex justify-between">
                                <span className="text-gray-600">土地予算の有無</span>
                                <span>{formatYesNo(form.hasLandBudget)}</span>
                            </div>
                            {form.hasLandBudget && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">土地予算</span>
                                    <span>{formatCurrency(form.landBudget)}</span>
                                </div>
                            )}
                        </>
                    )}
                    <div className="flex justify-between">
                        <span className="text-gray-600">テクノストラクチャー工法</span>
                        <span>{formatYesNo(form.usesTechnostructure)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">付加断熱工法</span>
                        <span>{formatYesNo(form.usesAdditionalInsulation)}</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
