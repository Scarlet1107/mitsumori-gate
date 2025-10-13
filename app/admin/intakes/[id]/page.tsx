import Link from "next/link";
import { notFound } from "next/navigation";
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
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-12 text-slate-900">
            <Link
                href="/admin/intakes"
                className="text-sm font-medium text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline"
            >
                ← 一覧へ戻る
            </Link>

            <header className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Intake Detail
                </p>
                <h1 className="text-3xl font-semibold">{record.customerName}</h1>
                <p className="text-sm text-slate-500">
                    作成日時: {record.createdAt.toLocaleString("ja-JP")} / 状態: {record.status}
                </p>
            </header>

            <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <dl className="grid gap-6">
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
                            <div key={key}>
                                <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                    {label}
                                </dt>
                                <dd className="mt-1 text-base text-slate-800">{String(value)}</dd>
                            </div>
                        );
                    })}
                </dl>
            </section>
        </main>
    );
}
