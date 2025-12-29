import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDeletedCustomers } from "@/lib/customer-store";
import { AdminDeletedCustomerTable } from "../components/AdminDeletedCustomerTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDeletedPage() {
    const { customers, total } = await getDeletedCustomers(50, 0);
    const serializedCustomers = customers.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email ?? "",
        phone: customer.phone ?? "",
        inputMode: customer.inputMode ?? "",
        createdAt: customer.createdAt.toISOString(),
        deletedAt: customer.deletedAt?.toISOString() ?? customer.updatedAt.toISOString(),
        webCompleted: customer.webCompleted,
        inPersonCompleted: customer.inPersonCompleted,
    }));

    return (
        <div className="container mx-auto max-w-7xl space-y-8 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">削除済み顧客</h1>
                    <p className="text-muted-foreground">
                        {total}件の削除済み顧客を確認できます。
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/admin">管理画面に戻る</Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>削除済み一覧</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                    <AdminDeletedCustomerTable initialCustomers={serializedCustomers} />
                </CardContent>
            </Card>
        </div>
    );
}
