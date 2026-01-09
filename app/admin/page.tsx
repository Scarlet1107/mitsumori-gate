export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminCustomers, getDeletedCustomers } from "@/lib/customer-store";
import { getAllConfigs } from "@/lib/config-store";
import { AdminCustomerTable } from "./components/AdminCustomerTable";

export default async function AdminPage() {
    const pageSize = 10;
    const { customers, total } = await getAdminCustomers({ limit: pageSize, offset: 0 });
    const { total: deletedTotal } = await getDeletedCustomers(1, 0);
    const configCount = (await getAllConfigs()).length;
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
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">管理画面</h1>
                    <p className="text-muted-foreground">
                        顧客一覧と設定値の管理を行います。
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/">フォームに戻る</Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-base">設定値管理</CardTitle>
                        <p className="text-xs text-muted-foreground">
                            登録済み {configCount} 項目
                        </p>
                    </CardHeader>
                    <CardContent>
                        <Button asChild size="sm">
                            <Link href="/admin/config">設定を開く</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-base">顧客データ</CardTitle>
                        <p className="text-xs text-muted-foreground">
                            全{total}件 / 削除済み {deletedTotal}件
                        </p>
                    </CardHeader>
                    <CardContent>
                        <Button asChild size="sm" variant="outline">
                            <Link href="/admin/deleted">削除済み一覧</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>顧客一覧</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        作成日時の新しい順に表示しています。
                    </p>
                </CardHeader>
                <CardContent>
                    <AdminCustomerTable
                        initialCustomers={serializedCustomers}
                        initialTotal={total}
                        pageSize={pageSize}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
