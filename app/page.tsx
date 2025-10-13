import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-foreground">
      <Card className="max-w-xl items-center text-center">
        <CardHeader className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Mitsumori Gate
          </span>
          <CardTitle className="text-3xl sm:text-4xl">
            初回面談をスムーズにする事前ヒアリングフォーム
          </CardTitle>
          <CardDescription className="text-base leading-relaxed text-muted-foreground">
            タブレットまたはスマホから事前に必要情報を入力し、スタッフとの会話に集中できる環境を整えます。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href="/consent">入力をはじめる</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full px-8"
          >
            <Link href="/admin/intakes">社内管理画面へ</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
