"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

function DoneContent() {
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode");
    const homeUrl = process.env.NEXT_PUBLIC_CORPORATE_HOME_URL || "/";

    const messages = {
        web: "ご入力ありがとうございました。より詳しい資金計画や土地・間取りのご相談は、対面にて丁寧にご案内いたします。ぜひお気軽にお問い合わせください。",
        inperson: "ご入力いただきありがとうございました。",
    };

    const message =
        mode === "web"
            ? messages.web
            : mode === "inperson"
                ? messages.inperson
                : messages.web;

    return (
        <Card className="w-full items-center text-center">
            <CardHeader className="flex flex-col items-center space-y-3 pb-4 w-full">
                <Image
                    src="/logo1.png"
                    alt="Company Logo"
                    width={220}
                    height={36}
                    priority
                    className="pointer-events-none select-none"
                />
                <Badge variant="secondary" className="px-4 py-1 text-sm">
                    完了しました
                </Badge>
                <CardTitle className="text-3xl">入力が完了しました</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                    {message}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 pb-6">
                <Button asChild size="lg" className="rounded-full px-8">
                    <Link href={homeUrl}>ホームへ戻る</Link>
                </Button>
            </CardContent>
        </Card>
    );
}

export default function DonePage() {
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-12 text-foreground">
            <Suspense
                fallback={
                    <Card className="w-full items-center text-center">
                        <CardHeader className="flex flex-col items-center space-y-3 pb-4 w-full">
                            <Image
                                src="/logo1.png"
                                alt="Company Logo"
                                width={220}
                                height={36}
                                priority
                                className="pointer-events-none select-none"
                            />
                            <Badge variant="secondary" className="px-4 py-1 text-sm">
                                完了しました
                            </Badge>
                            <CardTitle className="text-3xl">入力が完了しました</CardTitle>
                            <CardDescription className="text-base leading-relaxed">
                                読み込み中...
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2 pb-6">
                            <Button asChild size="lg" className="rounded-full px-8">
                                <Link href={process.env.NEXT_PUBLIC_CORPORATE_HOME_URL || "/"}>
                                    ホームへ戻る
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                }
            >
                <DoneContent />
            </Suspense>
        </main>
    );
}
