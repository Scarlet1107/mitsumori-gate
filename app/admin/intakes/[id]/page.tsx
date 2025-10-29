import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatNumber, formatYen } from "@/lib/format";
import { findSimulation } from "@/lib/simulation-store";

export const dynamic = "force-dynamic";

function formatYesNo(value: boolean): string {
    return value ? "はい" : "いいえ";
}

export default async function AdminSimulationDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const record = await findSimulation(id);

    if (!record) {
        notFound();
    }

    const summary = [
        {
            label: "借入上限額（目安）",
            value: formatYen(record.maxLoan),
        },
        {
            label: "希望借入額",
            value: formatYen(record.wishLoan),
        },
        {
            label: "世帯年収",
            value: formatYen(record.householdAnnualIncome),
        },
        {
            label: "返済比率",
            value:
                record.ratio != null
                    ? `${formatNumber(record.ratio * 100, 1)}%`
                    : "—",
        },
    ];

    const inputItems: Array<{ label: string; value: string }> = [
        { label: "年齢", value: `${record.age} 歳` },
        { label: "郵便番号", value: record.postalCode },
        {
            label: "年収（夫）",
            value: formatYen(record.incomeHusband),
        },
        {
            label: "年収（妻）",
            value: formatYen(record.incomeWife),
        },
        {
            label: "他の借入返済額（年間）",
            value: formatYen(record.otherLoanAnnualRepay),
        },
        {
            label: "自己資金（頭金）",
            value: formatYen(record.headMoney),
        },
        {
            label: "土地の有無",
            value: formatYesNo(record.hasLand),
        },
        {
            label: "希望月返済額",
            value: `${formatYen(record.wishMonthly)} / 月`,
        },
        {
            label: "希望返済期間（年）",
            value: `${record.termYearsSelected} 年`,
        },
        {
            label: "計算上の返済期間（年）",
            value: `${record.termYearsEffective} 年`,
        },
        {
            label: "ボーナス返済の利用",
            value: formatYesNo(record.bonusEnabled),
        },
        {
            label: "ボーナス1回あたり返済額",
            value: record.bonusEnabled
                ? formatYen(record.bonusPerPayment)
                : "—",
        },
    ];

    const resultItems: Array<{ label: string; value: string }> = [
        {
            label: "年間ボーナス返済額",
            value: record.bonusEnabled
                ? formatYen(record.bonusAnnual)
                : "—",
        },
        {
            label: "ボーナス分平均月額",
            value: record.bonusEnabled
                ? formatYen(record.bonusMonthly)
                : "—",
        },
        {
            label: "希望返済額（ボーナス込み）",
            value: formatYen(record.wishMonthlyTotal),
        },
        {
            label: "借入余力（年間）",
            value: formatYen(record.availableAnnualForThisLoan),
        },
        {
            label: "借入余力（月額）",
            value: formatYen(record.availableMonthlyForThisLoan),
        },
        {
            label: "総予算（建物目安）",
            value: formatYen(record.budgetForBuilding),
        },
        {
            label: "目安延床面積",
            value: `約 ${formatNumber(record.tsubo, 2)} 坪 / ${formatNumber(record.squareMeters, 2)}㎡`,
        },
        {
            label: "借入期間（月）",
            value: `${record.termMonths} ヶ月`,
        },
        {
            label: "月次金利",
            value: `${formatNumber(record.monthlyRate * 100, 3)}%`,
        },
        {
            label: "年齢から算出した最大返済期間",
            value: `${record.maxTermByAge} 年`,
        },
    ];

    const configItems: Array<{ label: string; value: string }> = [
        {
            label: "使用金利（年率）",
            value: `${formatNumber(record.configAnnualInterestRate * 100, 2)}%`,
        },
        {
            label: "最大返済年数の上限",
            value: `${record.configMaxTermYearsCap} 年`,
        },
        {
            label: "DTI 値",
            value: `${formatNumber(record.configDtiRatio * 100, 1)}%`,
        },
        {
            label: "建物単価（坪単価）",
            value: formatYen(record.configUnitPricePerTsubo),
        },
    ];

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-12 text-foreground">
            <div>
                <Button
                    asChild
                    variant="link"
                    className="px-0 text-sm text-muted-foreground"
                >
                    <Link href="/admin/intakes">← 一覧へ戻る</Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="space-y-2">
                    <CardDescription className="text-xs uppercase tracking-[0.3em]">
                        Simulation Detail
                    </CardDescription>
                    <CardTitle className="text-3xl">
                        シミュレーション結果
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>
                            作成日時: {record.createdAt.toLocaleString("ja-JP")}
                        </span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>
                            更新日時: {record.updatedAt.toLocaleString("ja-JP")}
                        </span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>ID: {record.id}</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    <section>
                        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Summary
                        </h2>
                        <dl className="mt-3 grid gap-4 md:grid-cols-2">
                            {summary.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-lg border bg-muted/30 px-4 py-3"
                                >
                                    <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                        {item.label}
                                    </dt>
                                    <dd className="mt-1 text-lg font-semibold text-foreground">
                                        {item.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    <Separator />

                    <section>
                        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            入力内容
                        </h2>
                        <dl className="mt-3 grid gap-4 md:grid-cols-2">
                            {inputItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-lg border bg-muted/30 px-4 py-3"
                                >
                                    <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                        {item.label}
                                    </dt>
                                    <dd className="mt-1 text-base text-foreground">
                                        {item.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    <Separator />

                    <section>
                        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            計算結果
                        </h2>
                        <dl className="mt-3 grid gap-4 md:grid-cols-2">
                            {resultItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-lg border bg-muted/30 px-4 py-3"
                                >
                                    <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                        {item.label}
                                    </dt>
                                    <dd className="mt-1 text-base text-foreground">
                                        {item.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    <Separator />

                    <section>
                        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            設定値
                        </h2>
                        <dl className="mt-3 grid gap-4 md:grid-cols-2">
                            {configItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-lg border bg-muted/30 px-4 py-3"
                                >
                                    <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                        {item.label}
                                    </dt>
                                    <dd className="mt-1 text-base text-foreground">
                                        {item.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                </CardContent>
            </Card>
        </main>
    );
}
