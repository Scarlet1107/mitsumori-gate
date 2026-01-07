"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";

function CoverPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const mode = useMemo(() => {
        const param = searchParams.get("mode");
        return param === "inperson" ? "inperson" : "web";
    }, [searchParams]);

    const handleStart = () => {
        const params = new URLSearchParams();
        params.set("mode", mode);
        const customerId = searchParams.get("customerId");
        const newEntry = searchParams.get("newEntry");
        const draftName = searchParams.get("draftName");
        if (customerId) params.set("customerId", customerId);
        if (newEntry) params.set("newEntry", newEntry);
        if (draftName) params.set("draftName", draftName);
        router.push(`/consent?${params.toString()}`);
    };

    return (
        <main className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-12 text-foreground">

            <div className="w-full rounded-[36px] border border-emerald-100/70 bg-white/80 px-6 py-12 text-center shadow-[0_22px_80px_rgba(15,23,42,0.12)] backdrop-blur">
                <div className="flex flex-col items-center gap-4">
                    <Image
                        src="/logo1.png"
                        alt="Logo"
                        width={200}
                        height={34}
                        draggable={false}
                        className="pointer-events-none select-none mb-4"
                    />
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                        家づくりかんたんシミュレーション
                    </h1>
                    <p className="max-w-2xl text-xl font-medium leading-relaxed text-slate-700 sm:text-2xl lg:text-3xl">
                        あなたにとって最適な住宅ローンとプランを見つけましょう
                    </p>
                </div>

                <div className="mt-10 flex justify-center">
                    <Button onClick={handleStart} className="rounded-full px-10 py-6 text-base sm:text-lg">
                        シミュレーションを始める
                    </Button>
                </div>
            </div>
        </main>
    );
}

export default function CoverPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CoverPageContent />
        </Suspense>
    );
}
