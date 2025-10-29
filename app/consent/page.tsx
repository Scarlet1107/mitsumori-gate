"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, Suspense } from "react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

function ConsentPageContent() {
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
        <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-6 py-12 text-foreground">
            <header className="space-y-2 pt-8 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Step 1 / 15
                </p>
                <h1 className="text-3xl font-semibold">ご利用前のお願い</h1>
                <p className="text-base text-muted-foreground">
                    シミュレーションを開始する前に、以下の前提に同意をお願いします。
                </p>
            </header>

            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle>以下の内容をご確認ください</CardTitle>
                    <CardDescription>チェック後にスタートできます。</CardDescription>
                </CardHeader>
                <CardContent>
                    <Label
                        htmlFor="consent"
                        className="flex cursor-pointer items-start gap-4 rounded-xl bg-muted/40 px-5 py-4 transition hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <Checkbox
                            id="consent"
                            checked={agreed}
                            onCheckedChange={(value) => setAgreed(Boolean(value))}
                            className="mt-1 size-6"
                        />
                        <span className="space-y-1">
                            <span className="text-base font-semibold text-foreground">同意します</span>
                            <span className="block text-sm text-muted-foreground space-y-2">
                                <p>入力いただいた個人情報は社内でのシミュレーションと提案検討のみに利用します。</p>
                                <p>提案資料・見積内容を外部に公開しないことを確認しました。</p>
                                <p>表示される金額はすべて目安であり、審査・金利条件・諸費用により実際と異なる場合があることを理解しています。</p>
                            </span>
                        </span>
                    </Label>
                </CardContent>
            </Card>

            <div className="mt-auto flex justify-end">
                <Button
                    type="button"
                    disabled={!agreed}
                    onClick={handleContinue}
                    className="rounded-full px-8"
                >
                    入力へ進む
                </Button>
            </div>
        </main>
    );
}

export default function ConsentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ConsentPageContent />
        </Suspense>
    );
}
