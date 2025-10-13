import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function DonePage() {
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6 py-12 text-foreground">
            <Card className="w-full items-center text-center">
                <CardHeader className="space-y-4">
                    <Badge variant="secondary" className="px-4 py-1 text-sm">
                        完了しました
                    </Badge>
                    <CardTitle className="text-3xl">
                        入力が完了しました
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                        ご協力ありがとうございます。入力内容はスタッフが確認し、次回の面談に活用いたします。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild size="lg" className="rounded-full px-8">
                        <Link href="/">ホームへ戻る</Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}
