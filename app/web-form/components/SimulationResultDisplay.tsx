/**
 * SimulationResultDisplay - ローンシミュレーション結果表示コンポーネント
 */

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingNumber } from "@/components/ui/skeleton";

interface SimulationResult {
    maxLoanAmount: number;
    wishLoanAmount: number;
    totalBudget: number;
    buildingBudget: number;
    estimatedTsubo: number;
    estimatedSquareMeters: number;
    monthlyPaymentCapacity: number;
    dtiRatio: number;
    loanRatio: number;
    totalPayment: number;
    totalInterest: number;
    interestRate: number;
    loanTerm: number;
}

interface SimulationResultDisplayProps {
    simulationResult: SimulationResult | null;
    loading?: boolean;
}

export function SimulationResultDisplay({ simulationResult, loading = false }: SimulationResultDisplayProps) {
    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">更新された試算結果</h3>

            {/* メイン指標 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">借入金額</p>
                    <p className="text-2xl font-bold text-blue-600">
                        <LoadingNumber
                            loading={loading}
                            value={simulationResult ? `${Math.round(simulationResult.wishLoanAmount).toLocaleString()}万円` : "---万円"}
                            skeletonWidth="w-24"
                            skeletonHeight="h-8"
                        />
                    </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">総予算</p>
                    <p className="text-2xl font-bold text-green-600">
                        <LoadingNumber
                            loading={loading}
                            value={simulationResult ? `${Math.round(simulationResult.totalBudget).toLocaleString()}万円` : "---万円"}
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
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-600">建築予算</p>
                        <p className="font-bold">
                            <LoadingNumber
                                loading={loading}
                                value={simulationResult ? `${Math.round(simulationResult.buildingBudget).toLocaleString()}万円` : "---万円"}
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
                                value={simulationResult ? `${Math.round(simulationResult.totalPayment).toLocaleString()}万円` : "---万円"}
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
                                value={simulationResult ? `${Math.round(simulationResult.totalInterest).toLocaleString()}万円` : "---万円"}
                                skeletonWidth="w-16"
                                skeletonHeight="h-4"
                            />
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>返済負担率</span>
                        <span className={!loading && simulationResult && simulationResult.dtiRatio > 30 ? 'text-red-600' : 'text-green-600'}>
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
