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
      <Card className="w-full max-w-3xl text-center">
        <CardHeader className="flex flex-col items-center space-y-3 w-full">
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
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/web-form">Web入力（来店前）</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-8"
            >
              <Link href="/inperson-form">対面入力（来店時）</Link>
            </Button>
          </div>
          <div className="pt-4 border-t">
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="text-muted-foreground"
            >
              <Link href="/admin" prefetch={false}>
                社内管理画面へ
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
