"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

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

const getStatusMeta = (customer: CustomerRow) => {
    if (customer.inPersonCompleted) {
        return { label: "対面完了", className: "bg-amber-100 text-amber-700 border-amber-200" };
    }
    if (customer.webCompleted) {
        return { label: "Web完了", className: "bg-sky-100 text-sky-700 border-sky-200" };
    }
    return { label: "入力中", className: "bg-slate-100 text-slate-700 border-slate-200" };
};

export function AdminDeletedCustomerTable({ initialCustomers }: AdminDeletedCustomerTableProps) {
    const [customers, setCustomers] = useState<CustomerRow[]>(initialCustomers);
    const [restoringId, setRestoringId] = useState<string | null>(null);
    const [restoreId, setRestoreId] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const handleRestore = async () => {
        if (!restoreId) return;
        setRestoringId(restoreId);
        setActionMessage(null);
        try {
            const response = await fetch(`/api/customers/${restoreId}/restore`, { method: "POST" });
            if (!response.ok) {
                throw new Error("復元に失敗しました");
            }
            setCustomers(prev => prev.filter(customer => customer.id !== restoreId));
            setActionMessage("顧客情報を復元しました");
            setRestoreId(null);
        } catch (error) {
            console.error(error);
            setActionMessage(error instanceof Error ? error.message : "復元に失敗しました");
        } finally {
            setRestoringId(null);
        }
    };

    return (
        <div className="space-y-4">
            {actionMessage && (
                <p className="text-sm text-muted-foreground px-6">{actionMessage}</p>
            )}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="px-6">削除日時</TableHead>
                            <TableHead className="px-6">お名前</TableHead>
                            <TableHead className="px-6">メールアドレス</TableHead>
                            <TableHead className="px-6">電話番号</TableHead>
                            <TableHead className="px-6">状態</TableHead>
                            <TableHead className="px-6 text-right">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.length === 0 ? (
                            <TableRow>
                                <TableCell className="px-6 py-10 text-center text-muted-foreground" colSpan={6}>
                                    削除済みの顧客はありません。
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.map(customer => {
                                const { label, className } = getStatusMeta(customer);
                                return (
                                    <TableRow key={customer.id}>
                                        <TableCell className="px-6 text-muted-foreground">
                                            {formatDateTime(customer.deletedAt)}
                                        </TableCell>
                                        <TableCell className="px-6 font-medium">
                                            {customer.name}
                                        </TableCell>
                                        <TableCell className="px-6">
                                            {customer.email ? (
                                                <span className="block max-w-[220px] truncate text-sm text-muted-foreground" title={customer.email}>
                                                    {customer.email}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">未登録</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6">
                                            {customer.phone ? customer.phone : (
                                                <span className="text-xs text-muted-foreground">未登録</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6">
                                            <Badge variant="outline" className={cn("bg-white", className)}>
                                                {label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={restoringId === customer.id}
                                                onClick={() => setRestoreId(customer.id)}
                                            >
                                                {restoringId === customer.id ? "復元中..." : "復元する"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={Boolean(restoreId)} onOpenChange={(open) => !open && setRestoreId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>顧客情報を復元しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                            復元すると顧客一覧に戻ります。よろしいですか？
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={restoringId !== null}>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRestore}
                            disabled={restoringId !== null}
                        >
                            復元する
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
