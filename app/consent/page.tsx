"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

export default function ConsentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [agreed, setAgreed] = useState(false);

    const from = searchParams.get("from") ?? undefined;

    const handleContinue = useCallback(() => {
        const params = new URLSearchParams();
        params.set("consent", "true");
        if (from) {
            params.set("from", from);
        }
        router.push(`/intake?${params.toString()}`);
    }, [router, from]);

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-10 px-6 py-12 text-slate-900">
            <header className="space-y-4 pt-10">
                <p className="text-sm font-medium text-slate-500">Step 1 / 8</p>
                <h1 className="text-2xl font-semibold">個人情報のお取り扱いについて</h1>
                <p className="text-base leading-relaxed text-slate-600">
                    お預かりする情報は、見積りやご案内の目的に限って利用し、適切に管理します。
                    内容に同意いただける場合は、下のスイッチをオンにしてください。
                </p>
            </header>

            <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between gap-6">
                    <div className="space-y-1">
                        <p className="text-lg font-medium">同意します（必須）</p>
                        <p className="text-sm text-slate-500">
                            スイッチをオンにすると入力フォームへ進めます。
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-pressed={agreed}
                        onClick={() => setAgreed((prev) => !prev)}
                        className={`relative h-10 w-20 rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 ${agreed ? "bg-slate-900" : "bg-slate-200"
                            }`}
                    >
                        <span
                            className={`absolute top-1 left-1 h-8 w-8 rounded-full bg-white transition ${agreed ? "translate-x-10" : "translate-x-0"
                                }`}
                        />
                    </button>
                </div>
            </section>

            <div className="mt-auto flex justify-end">
                <button
                    type="button"
                    disabled={!agreed}
                    onClick={handleContinue}
                    className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-slate-900/10 transition enabled:hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                    入力へ進む
                </button>
            </div>
        </main>
    );
}
