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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { listIntakes } from "@/lib/intake-store";

export const dynamic = "force-dynamic";

export default async function AdminIntakesPage() {
    const { items } = await listIntakes({ limit: 50 });

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12 text-foreground">
            <Card className="border-none bg-transparent shadow-none">
                <CardHeader className="px-0">
                    <CardDescription className="text-xs font-semibold uppercase tracking-[0.3em]">
                        Admin
                    </CardDescription>
                    <CardTitle className="text-3xl">Intake Entries</CardTitle>
                    <CardDescription>最新の入力が上に表示されます。</CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl">最新の入力一覧</CardTitle>
                    <CardDescription>直近50件の来場前ヒアリング結果です。</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="px-6">顧客名</TableHead>
                                <TableHead className="px-6">ステータス</TableHead>
                                <TableHead className="px-6">作成日時</TableHead>
                                <TableHead className="px-6" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell className="px-6 py-10 text-center text-muted-foreground" colSpan={4}>
                                        まだ入力がありません。
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="px-6 font-medium">
                                            {item.customerName}
                                        </TableCell>
                                        <TableCell className="px-6">
                                            <Badge variant="outline" className="capitalize">
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 text-muted-foreground">
                                            {item.createdAt.toLocaleString("ja-JP")}
                                        </TableCell>
                                        <TableCell className="px-6 text-right">
                                            <Button asChild variant="link" className="px-0">
                                                <Link href={`/admin/intakes/${item.id}`}>
                                                    詳細を見る
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
}
