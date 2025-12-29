"use client";

/**
 * SimulationResultDisplay - ローンシミュレーション結果表示コンポーネント（対面フォーム用）
 */

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingNumber } from "@/components/ui/skeleton";
import { formatManWithOku } from "@/lib/format";
import type { SimulationResult } from "@/lib/simulation/engine";

interface SimulationResultDisplayProps {
    simulationResult: SimulationResult | null;
    loading?: boolean;
    usesTechnostructure?: boolean | null;
}

export function InPersonSimulationResultDisplay({
    simulationResult,
    loading = false,
    usesTechnostructure,
}: SimulationResultDisplayProps) {
    const showWarning = !loading && simulationResult?.warnings &&
        (simulationResult.warnings.exceedsMaxLoan || simulationResult.warnings.exceedsMaxTerm);
    const specLabel = usesTechnostructure === null || usesTechnostructure === undefined
        ? "未選択"
        : usesTechnostructure
            ? "テクノストラクチャー + 長期優良住宅"
            : "長期優良住宅仕様";

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">更新された試算結果</h3>

            {showWarning && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {simulationResult?.warnings.exceedsMaxLoan && (
                        <p>※ 上限借入額を超えています。条件の見直しが必要です。</p>
                    )}
                    {simulationResult?.warnings.exceedsMaxTerm && (
                        <p>※ 年齢上限を超える返済年数になっています。</p>
                    )}
                </div>
            )}

            {/* メイン指標 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-gray-600">借入金額</p>
                    <p className="text-2xl font-bold text-emerald-700">
                        <LoadingNumber
                            loading={loading}
                            value={simulationResult ? formatManWithOku(simulationResult.wishLoanAmount) : "---"}
                            skeletonWidth="w-24"
                            skeletonHeight="h-8"
                        />
                    </p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-gray-600">総予算</p>
                    <p className="text-2xl font-bold text-emerald-600">
                        <LoadingNumber
                            loading={loading}
                            value={simulationResult ? formatManWithOku(simulationResult.totalBudget) : "---"}
                            skeletonWidth="w-24"
                            skeletonHeight="h-8"
                        />
                    </p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-gray-600">最大借入可能額</p>
                    <p className="text-2xl font-bold text-emerald-700">
                        <LoadingNumber
                            loading={loading}
                            value={simulationResult ? formatManWithOku(simulationResult.maxLoanAmount) : "---"}
                            skeletonWidth="w-24"
                            skeletonHeight="h-8"
                        />
                    </p>
                </div>
            </div>

            <Separator className="my-4" />

            {/* 建築プラン */}
            <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">建築プラン目安</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-600">建築費用</p>
                        <p className="font-bold">
                            <LoadingNumber
                                loading={loading}
                                value={simulationResult ? formatManWithOku(simulationResult.buildingBudget) : "---"}
                                skeletonWidth="w-16"
                                skeletonHeight="h-5"
                            />
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">推定坪数</p>
                        <p className="font-bold">
                            <LoadingNumber
                                loading={loading}
                                value={simulationResult ? `${simulationResult.estimatedTsubo.toFixed(1)}坪` : "---坪"}
                                skeletonWidth="w-12"
                                skeletonHeight="h-5"
                            />
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-600">土地代</p>
                        <p className="font-bold">
                            <LoadingNumber
                                loading={loading}
                                value={simulationResult ? formatManWithOku(simulationResult.landCost) : "---"}
                                skeletonWidth="w-16"
                                skeletonHeight="h-5"
                            />
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">解体費用</p>
                        <p className="font-bold">
                            <LoadingNumber
                                loading={loading}
                                value={simulationResult ? formatManWithOku(simulationResult.demolitionCost) : "---"}
                                skeletonWidth="w-16"
                                skeletonHeight="h-5"
                            />
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">諸経費</p>
                        <p className="font-bold">
                            <LoadingNumber
                                loading={loading}
                                value={simulationResult ? formatManWithOku(simulationResult.miscCost) : "---"}
                                skeletonWidth="w-16"
                                skeletonHeight="h-5"
                            />
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-600">推定床面積</p>
                        <p className="font-bold">
                            <LoadingNumber
                                loading={loading}
                                value={simulationResult ? `${simulationResult.estimatedSquareMeters.toFixed(1)}㎡` : "---㎡"}
                                skeletonWidth="w-12"
                                skeletonHeight="h-5"
                            />
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">仕様</p>
                        <p className="font-bold text-emerald-700">
                            {specLabel}
                        </p>
                    </div>
                </div>
            </div>

            <Separator className="my-4" />

            {/* 返済詳細 */}
            <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">返済詳細</h4>
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span>総返済額</span>
                        <span>
                            <LoadingNumber
                                loading={loading}
                                value={simulationResult ? formatManWithOku(simulationResult.totalPayment) : "---"}
                                skeletonWidth="w-16"
                                skeletonHeight="h-4"
                            />
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>利息総額</span>
                        <span>
                            <LoadingNumber
                                loading={loading}
                                value={simulationResult ? formatManWithOku(simulationResult.totalInterest) : "---"}
                                skeletonWidth="w-16"
                                skeletonHeight="h-4"
                            />
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>返済負担率</span>
                        <span className={!loading && simulationResult && simulationResult.dtiRatio > 30 ? 'text-red-600' : 'text-emerald-600'}>
                            <LoadingNumber
                                loading={loading}
                                value={simulationResult ? `${simulationResult.dtiRatio.toFixed(1)}%` : "---%"}
                                skeletonWidth="w-12"
                                skeletonHeight="h-4"
                            />
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
