import Link from "next/link";

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
import { formatNumber, formatYen } from "@/lib/format";
import { listSimulations } from "@/lib/simulation-store";

export const dynamic = "force-dynamic";

export default async function AdminIntakesPage() {
    const { items } = await listSimulations({ limit: 50 });

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12 text-foreground">
            <Card className="border-none bg-transparent shadow-none">
                <CardHeader className="px-0">
                    <CardDescription className="text-xs font-semibold uppercase tracking-[0.3em]">
                        Admin
                    </CardDescription>
                    <CardTitle className="text-3xl">シミュレーションの保存履歴</CardTitle>
                    <CardDescription>最新のシミュレーション結果が上に表示されます。</CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl">最新のシミュレーション</CardTitle>
                    <CardDescription>直近50件の保存結果です。</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="px-6">作成日時</TableHead>
                                <TableHead className="px-6">世帯年収</TableHead>
                                <TableHead className="px-6">借入上限額</TableHead>
                                <TableHead className="px-6">希望借入額</TableHead>
                                <TableHead className="px-6">返済比率</TableHead>
                                <TableHead className="px-6" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell className="px-6 py-10 text-center text-muted-foreground" colSpan={6}>
                                        まだ入力がありません。
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="px-6 text-muted-foreground">
                                            {item.createdAt.toLocaleString("ja-JP")}
                                        </TableCell>
                                        <TableCell className="px-6 font-medium">
                                            {item.householdAnnualIncome != null
                                                ? formatYen(item.householdAnnualIncome)
                                                : "—"}
                                        </TableCell>
                                        <TableCell className="px-6">
                                            {formatYen(item.maxLoan)}
                                        </TableCell>
                                        <TableCell className="px-6">
                                            {formatYen(item.wishLoan)}
                                        </TableCell>
                                        <TableCell className="px-6 text-muted-foreground">
                                            {item.ratio != null
                                                ? `${formatNumber(item.ratio * 100, 1)}%`
                                                : "—"}
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
