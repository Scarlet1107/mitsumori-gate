export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllCustomers, getDeletedCustomers } from "@/lib/customer-store";
import { getAllConfigs } from "@/lib/config-store";
import { AdminCustomerTable } from "./components/AdminCustomerTable";

export default async function AdminPage() {
    const { customers } = await getAllCustomers(20, 0);
    const { total: deletedTotal } = await getDeletedCustomers(1, 0);
    const configs = await getAllConfigs();
    const serializedCustomers = customers.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email ?? "",
        phone: customer.phone ?? "",
        inputMode: customer.inputMode ?? "",
        createdAt: customer.createdAt.toISOString(),
        webCompleted: customer.webCompleted,
        inPersonCompleted: customer.inPersonCompleted,
    }));

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
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{customers.length}件の顧客データ</span>
                            <Button asChild variant="outline" size="sm">
                                <Link href="/admin/deleted">削除済み {deletedTotal}件</Link>
                            </Button>
                        </div>
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

            <Card>
                <CardHeader>
                    <CardTitle>最近の顧客</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                    <AdminCustomerTable initialCustomers={serializedCustomers} />
                </CardContent>
            </Card>
        </div>
    );
}
