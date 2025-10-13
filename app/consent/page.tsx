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
            <header className="space-y-2 pt-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Step 1 / 8
                </p>
                <h1 className="text-3xl font-semibold">同意の確認</h1>
                <p className="text-base text-muted-foreground">
                    入力前に、個人情報の利用についてご確認ください。
                </p>
            </header>

            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle>個人情報の利用に同意します</CardTitle>
                    <CardDescription>同意すると入力フォームへ進みます。</CardDescription>
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
                            <span className="text-base font-semibold text-foreground">同意する</span>
                            <span className="block text-sm text-muted-foreground">利用目的を理解し、入力を進めます。</span>
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
