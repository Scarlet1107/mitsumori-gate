import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-slate-50 px-6 py-16 text-slate-900">
      <div className="max-w-xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
          Mitsumori Gate
        </p>
        <h1 className="mb-4 text-3xl font-semibold sm:text-4xl">
          初回面談をスムーズにする事前ヒアリングフォーム
        </h1>
        <p className="text-base leading-relaxed text-slate-600">
          タブレットまたはスマホから事前に必要情報を入力し、スタッフとの会話に集中できる環境を整えます。
        </p>
      </div>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/consent"
          className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-700"
        >
          入力をはじめる
        </Link>
        <Link
          href="/admin/intakes"
          className="rounded-full border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
        >
          社内管理画面へ
        </Link>
      </div>
    </main>
  );
}
