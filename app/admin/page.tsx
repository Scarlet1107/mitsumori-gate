
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllCustomers } from "@/lib/customer-store";
import { getAllConfigs } from "@/lib/config-store";

export default async function AdminPage() {
    const { customers } = await getAllCustomers(20, 0);
    const configs = await getAllConfigs();

    return (
        <div className="container mx-auto max-w-7xl space-y-8 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">管理画面</h1>
                    <p className="text-muted-foreground">
                        顧客情報と設定値を管理できます。
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href="/">フォームに戻る</Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* 設定値管理カード */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>設定値管理</CardTitle>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/admin/config">編集</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {configs.map((config) => (
                                <div key={config.key} className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        {config.description}
                                    </span>
                                    <span className="font-medium">
                                        {config.value}
                                        {config.key === "annual_interest_rate" || config.key === "dti_ratio" ? "%" :
                                            config.key === "unit_price_per_tsubo" ? "万円" : ""}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 顧客データ概要 */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>顧客データ</CardTitle>
                        <span className="text-sm text-muted-foreground">
                            {customers.length}件の顧客データ
                        </span>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Web入力完了</span>
                                <span className="font-medium">
                                    {customers.filter(c => c.webCompleted).length}件
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">対面入力完了</span>
                                <span className="font-medium">
                                    {customers.filter(c => c.inPersonCompleted).length}件
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">総顧客数</span>
                                <span className="font-medium">{customers.length}件</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 最近の顧客一覧 */}
            <Card>
                <CardHeader>
                    <CardTitle>最近の顧客</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="px-6">作成日時</TableHead>
                                <TableHead className="px-6">お名前</TableHead>
                                <TableHead className="px-6">入力方式</TableHead>
                                <TableHead className="px-6">状態</TableHead>
                                <TableHead className="px-6" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.length === 0 ? (
                                <TableRow>
                                    <TableCell className="px-6 py-10 text-center text-muted-foreground" colSpan={5}>
                                        まだ顧客データがありません。
                                    </TableCell>
                                </TableRow>
                            ) : (
                                customers.slice(0, 10).map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell className="px-6 text-muted-foreground">
                                            {customer.createdAt.toLocaleString("ja-JP")}
                                        </TableCell>
                                        <TableCell className="px-6 font-medium">
                                            {customer.name}
                                        </TableCell>
                                        <TableCell className="px-6">
                                            {customer.inputMode === "web" ? "Web入力" : "対面入力"}
                                        </TableCell>
                                        <TableCell className="px-6">
                                            {customer.webCompleted && customer.inPersonCompleted
                                                ? "完了"
                                                : customer.webCompleted
                                                    ? "Web完了"
                                                    : customer.inPersonCompleted
                                                        ? "対面完了"
                                                        : "入力中"}
                                        </TableCell>
                                        <TableCell className="px-6 text-right">
                                            <span className="text-sm text-muted-foreground">
                                                ID: {customer.id.slice(0, 8)}...
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
