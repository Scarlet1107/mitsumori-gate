"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CustomerRow {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    inputMode?: string | null;
    createdAt: string;
    deletedAt: string;
    webCompleted: boolean;
    inPersonCompleted: boolean;
}

interface AdminDeletedCustomerTableProps {
    initialCustomers: CustomerRow[];
}

const formatDateTime = (value: string) => {
    try {
        return new Date(value).toLocaleString("ja-JP");
    } catch {
        return value;
    }
};

export function AdminDeletedCustomerTable({ initialCustomers }: AdminDeletedCustomerTableProps) {
    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="px-6">削除日時</TableHead>
                            <TableHead className="px-6">お名前</TableHead>
                            <TableHead className="px-6">入力方式</TableHead>
                            <TableHead className="px-6">状態</TableHead>
                            <TableHead className="px-6 text-right">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialCustomers.length === 0 ? (
                            <TableRow>
                                <TableCell className="px-6 py-10 text-center text-muted-foreground" colSpan={5}>
                                    削除済みの顧客はありません。
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialCustomers.map(customer => (
                                <TableRow key={customer.id}>
                                    <TableCell className="px-6 text-muted-foreground">
                                        {formatDateTime(customer.deletedAt)}
                                    </TableCell>
                                    <TableCell className="px-6 font-medium">
                                        <div className="flex items-center gap-2">
                                            <span>{customer.name}</span>
                                            <Badge variant="secondary">削除済み</Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6">
                                        {customer.inputMode === "web"
                                            ? "Web入力"
                                            : customer.inputMode === "inperson"
                                                ? "対面入力"
                                                : "-"}
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
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/customers/${customer.id}`}>詳細</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
