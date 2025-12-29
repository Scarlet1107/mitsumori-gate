"use client";

import { useState } from "react";
import Link from "next/link";
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
import { Loader2 } from "lucide-react";

interface CustomerRow {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    inputMode?: string | null;
    createdAt: string;
    webCompleted: boolean;
    inPersonCompleted: boolean;
}

interface AdminCustomerTableProps {
    initialCustomers: CustomerRow[];
}

const formatDateTime = (value: string) => {
    try {
        return new Date(value).toLocaleString("ja-JP");
    } catch {
        return value;
    }
};

export function AdminCustomerTable({ initialCustomers }: AdminCustomerTableProps) {
    const [customers, setCustomers] = useState<CustomerRow[]>(initialCustomers);
    const [saving, setSaving] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const resetActionMessage = () => setActionMessage(null);

    const handleDelete = async () => {
        if (!deleteId) return;
        setSaving(true);
        resetActionMessage();
        try {
            const response = await fetch(`/api/customers/${deleteId}`, { method: "DELETE" });
            if (!response.ok) {
                throw new Error("削除に失敗しました");
            }
            setCustomers(prev => prev.filter(customer => customer.id !== deleteId));
            setDeleteId(null);
        } catch (error) {
            console.error(error);
            setActionMessage(error instanceof Error ? error.message : "削除に失敗しました");
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadPdf = async (customer: CustomerRow) => {
        resetActionMessage();
        setDownloadingId(customer.id);
        try {
            const response = await fetch(`/api/customers/${customer.id}/pdf`);
            if (!response.ok) {
                throw new Error("PDFの生成に失敗しました");
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `simulation_${customer.name}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            setActionMessage(error instanceof Error ? error.message : "PDFの生成に失敗しました");
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <div className="space-y-4">
            {actionMessage && (
                <p className="text-sm text-red-600 px-6">{actionMessage}</p>
            )}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="px-6">作成日時</TableHead>
                            <TableHead className="px-6">お名前</TableHead>
                            <TableHead className="px-6">入力方式</TableHead>
                            <TableHead className="px-6">状態</TableHead>
                            <TableHead className="px-6 text-right">操作</TableHead>
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
                            customers.map(customer => (
                                <TableRow key={customer.id}>
                                    <TableCell className="px-6 text-muted-foreground">
                                        {formatDateTime(customer.createdAt)}
                                    </TableCell>
                                    <TableCell className="px-6 font-medium">
                                        {customer.name}
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
                                        <div className="flex items-center justify-end gap-2">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/admin/customers/${customer.id}`}>詳細</Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={downloadingId === customer.id}
                                                onClick={() => handleDownloadPdf(customer)}
                                            >
                                                {downloadingId === customer.id ? (
                                                    <span className="flex items-center gap-1">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        生成中...
                                                    </span>
                                                ) : (
                                                    "PDF"
                                                )}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => setDeleteId(customer.id)}
                                            >
                                                削除
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>顧客情報を削除済みにしますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                            削除済み一覧へ移動します。本当に削除してよろしいですか？
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={saving}>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={saving} className="bg-destructive text-destructive-foreground">
                            {saving ? "削除中..." : "削除する"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
