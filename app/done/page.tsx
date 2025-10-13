import Link from "next/link";

export default function DonePage() {
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-6 px-6 py-12 text-center text-slate-900">
            <div className="rounded-full bg-emerald-100 p-4">
                <span className="text-emerald-600">✓</span>
            </div>
            <h1 className="text-3xl font-semibold">入力が完了しました</h1>
            <p className="text-base leading-relaxed text-slate-600">
                ご協力ありがとうございます。入力内容はスタッフが確認し、次回の面談に活用いたします。
            </p>
            <Link
                href="/"
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-700"
            >
                ホームへ戻る
            </Link>
        </main>
    );
}
