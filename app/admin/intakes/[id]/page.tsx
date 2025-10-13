import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { findIntake } from "@/lib/intake-store";

export const dynamic = "force-dynamic";

const LABEL_MAP: Record<string, string> = {
    customer_name: "お名前",
    phone: "電話番号",
    email: "メールアドレス",
    address: "住所",
    annual_income: "年間収入（万円）",
    budget_total: "総予算（万円）",
    project_type: "ご希望の内容",
    from: "流入元",
};

const PROJECT_LABELS: Record<string, string> = {
    new: "新築",
    reform: "リフォーム",
    warehouse: "倉庫・その他",
};

export default async function AdminIntakeDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const record = await findIntake(params.id);

    if (!record) {
        notFound();
    }

    const view = {
        customer_name: record.customerName,
        phone: record.phone,
        email: record.email,
        address: record.address,
        annual_income: record.annualIncome,
        budget_total: record.budgetTotal,
        project_type: record.projectType,
        from: record.from,
    } satisfies Record<string, string | number | boolean | null | undefined>;

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-12 text-foreground">
            <div>
                <Button asChild variant="link" className="px-0 text-sm text-muted-foreground">
                    <Link href="/admin/intakes">← 一覧へ戻る</Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="space-y-2">
                    <CardDescription className="text-xs uppercase tracking-[0.3em]">
                        Intake Detail
                    </CardDescription>
                    <CardTitle className="text-3xl">{record.customerName}</CardTitle>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>作成日時: {record.createdAt.toLocaleString("ja-JP")}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <Badge variant="outline" className="capitalize">
                            {record.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <dl className="grid gap-5">
                        {Object.entries(LABEL_MAP).map(([key, label]) => {
                            let value = view[key as keyof typeof view];

                            if (key === "project_type" && typeof value === "string") {
                                value = PROJECT_LABELS[value] ?? value;
                            }

                            if (
                                (key === "annual_income" || key === "budget_total") &&
                                typeof value === "number"
                            ) {
                                value = `${value} 万円`;
                            }

                            if (value === undefined || value === null || value === "") {
                                value = "-";
                            }

                            return (
                                <div key={key} className="rounded-lg border bg-muted/30 px-4 py-3">
                                    <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                        {label}
                                    </dt>
                                    <dd className="mt-1 text-base text-foreground">
                                        {String(value)}
                                    </dd>
                                </div>
                            );
                        })}
                    </dl>
                </CardContent>
            </Card>
        </main>
    );
}
