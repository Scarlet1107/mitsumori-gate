"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, Suspense } from "react";
import Image from "next/image";

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
import { CONSENT_ITEMS } from "@/lib/consent-copy";

function ConsentPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [agreed, setAgreed] = useState(false);

    const mode = useMemo(() => {
        const param = searchParams.get("mode");
        return param === "inperson" ? "inperson" : "web";
    }, [searchParams]);

    const nextPath = useMemo(() => {
        const from = searchParams.get("from");
        if (from === "web-form" || from === "inperson-form") {
            return `/${from}`;
        }
        return mode === "inperson" ? "/inperson-form" : "/web-form";
    }, [mode, searchParams]);

    const handleContinue = useCallback(() => {
        const params = new URLSearchParams();
        params.set("consent", "true");
        params.set("mode", mode);
        const customerId = searchParams.get("customerId");
        const newEntry = searchParams.get("newEntry");
        const draftName = searchParams.get("draftName");
        if (customerId) params.set("customerId", customerId);
        if (newEntry) params.set("newEntry", newEntry);
        if (draftName) params.set("draftName", draftName);
        router.push(`${nextPath}?${params.toString()}`);
    }, [router, mode, nextPath, searchParams]);

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-6 py-12 text-foreground">
            <header className="space-y-2 pt-8 text-center">
                <div className="flex flex-col items-center gap-3">
                    <Image
                        src="/logo1.png"
                        alt="Logo"
                        width={180}
                        height={30}
                        draggable={false}
                        className="pointer-events-none select-none"
                    />
                    <p className="text-sm font-semibold text-muted-foreground">
                        家づくりかんたんシミュレーション
                    </p>
                </div>
                <h1 className="text-3xl font-semibold mt-4">ご利用前のお願い</h1>
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
                            <ol className="block list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                                {CONSENT_ITEMS.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ol>
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
