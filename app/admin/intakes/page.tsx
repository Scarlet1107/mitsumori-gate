import Link from "next/link";
import { listIntakes } from "@/lib/intake-store";

export const dynamic = "force-dynamic";

export default async function AdminIntakesPage() {
    const { items } = await listIntakes({ limit: 50 });

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-12 text-slate-900">
            <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                        Admin
                    </p>
                    <h1 className="text-3xl font-semibold">Intake Entries</h1>
                    <p className="text-sm text-slate-500">
                        最新の入力が上に表示されます。
                    </p>
                </div>
            </header>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
                        <tr>
                            <th className="px-6 py-3">顧客名</th>
                            <th className="px-6 py-3">ステータス</th>
                            <th className="px-6 py-3">作成日時</th>
                            <th className="px-6 py-3">詳細</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.length === 0 ? (
                            <tr>
                                <td className="px-6 py-10 text-center text-slate-500" colSpan={4}>
                                    まだ入力がありません。
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-slate-800">{item.customerName}</td>
                                    <td className="px-6 py-4 text-slate-500">{item.status}</td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {item.createdAt.toLocaleString("ja-JP")}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link
                                            className="text-sm font-medium text-slate-900 underline-offset-4 hover:underline"
                                            href={`/admin/intakes/${item.id}`}
                                        >
                                            詳細を見る
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </section>
        </main>
    );
}
