"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from "@tanstack/react-table";
import { Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
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
import { useToast } from "@/hooks/use-toast";

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
    initialTotal: number;
    pageSize: number;
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

const getInputModeLabel = (inputMode?: string | null) => {
    if (inputMode === "web") return "Web入力";
    if (inputMode === "inperson") return "対面入力";
    return "-";
};

export function AdminCustomerTable({ initialCustomers, initialTotal, pageSize }: AdminCustomerTableProps) {
    const router = useRouter();
    const [customers, setCustomers] = useState<CustomerRow[]>(initialCustomers);
    const [total, setTotal] = useState(initialTotal);
    const [pageIndex, setPageIndex] = useState(0);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const { toast } = useToast();
    const hasInteractedRef = useRef(false);

    const pageCount = Math.max(1, Math.ceil(total / pageSize));

    useEffect(() => {
        if (pageIndex > 0 && pageIndex >= pageCount) {
            setPageIndex(pageCount - 1);
        }
    }, [pageCount, pageIndex]);

    useEffect(() => {
        if (!hasInteractedRef.current && search.trim() === "" && pageIndex === 0) {
            return;
        }

        const controller = new AbortController();
        const timeout = setTimeout(async () => {
                const query = search.trim();
                setIsLoading(true);
            try {
                const params = new URLSearchParams({
                    query,
                    page: String(pageIndex),
                    limit: String(pageSize),
                });
                const response = await fetch(`/api/admin/customers?${params.toString()}`, {
                    signal: controller.signal,
                });
                if (!response.ok) {
                    throw new Error("顧客データの取得に失敗しました");
                }
                const data = await response.json();
                setCustomers(data.customers);
                setTotal(data.total);
            } catch (error) {
                if (controller.signal.aborted) return;
                console.error(error);
                toast({
                    title: "顧客データの取得に失敗しました",
                    description: error instanceof Error ? error.message : "もう一度お試しください。",
                    variant: "destructive",
                });
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }, 400);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [search, pageIndex, pageSize, toast]);

    const handleDelete = async () => {
        if (!deleteId) return;
        setSaving(true);
        try {
            const response = await fetch(`/api/customers/${deleteId}`, { method: "DELETE" });
            if (!response.ok) {
                throw new Error("削除に失敗しました");
            }
            setCustomers(prev => prev.filter(customer => customer.id !== deleteId));
            setTotal(prev => Math.max(prev - 1, 0));
            setDeleteId(null);
            toast({ title: "削除しました" });
        } catch (error) {
            console.error(error);
            toast({
                title: "削除に失敗しました",
                description: error instanceof Error ? error.message : "もう一度お試しください。",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadPdf = useCallback(async (customer: CustomerRow) => {
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
            toast({ title: "PDFを生成しました" });
        } catch (error) {
            console.error(error);
            toast({
                title: "PDFの生成に失敗しました",
                description: error instanceof Error ? error.message : "もう一度お試しください。",
                variant: "destructive",
            });
        } finally {
            setDownloadingId(null);
        }
    }, [toast]);

    const handleCopyEmail = useCallback(async (email: string, event: React.MouseEvent) => {
        event.stopPropagation();
        try {
            await navigator.clipboard.writeText(email);
            toast({ title: "メールアドレスをコピーしました" });
        } catch (error) {
            console.error(error);
            toast({ title: "コピーに失敗しました", variant: "destructive" });
        }
    }, [toast]);

    const columns = useMemo<ColumnDef<CustomerRow>[]>(
        () => [
            {
                accessorKey: "createdAt",
                header: "作成日時",
                cell: ({ row }) => (
                    <div className="text-muted-foreground">
                        {formatDateTime(row.getValue("createdAt"))}
                    </div>
                ),
            },
            {
                accessorKey: "name",
                header: "お名前",
                cell: ({ row }) => (
                    <div className="font-medium text-foreground">{row.getValue("name")}</div>
                ),
            },
            {
                accessorKey: "email",
                header: "メールアドレス",
                cell: ({ row }) => {
                    const email = row.getValue("email") as string;
                    if (!email) {
                        return <span className="text-xs text-muted-foreground">未登録</span>;
                    }
                    return (
                        <button
                            type="button"
                            onClick={(event) => handleCopyEmail(email, event)}
                            className="flex items-center gap-2 text-left text-sm text-muted-foreground transition hover:text-foreground"
                            title="クリックでコピー"
                        >
                            <span className="block max-w-[220px] truncate" title={email}>
                                {email}
                            </span>
                            <Copy className="size-3.5" />
                        </button>
                    );
                },
            },
            {
                accessorKey: "phone",
                header: "電話番号",
                cell: ({ row }) => {
                    const phone = row.getValue("phone") as string;
                    return phone ? phone : <span className="text-xs text-muted-foreground">未登録</span>;
                },
            },
            {
                accessorKey: "inputMode",
                header: "入力方式",
                cell: ({ row }) => (
                    <Badge variant="outline" className="bg-white">
                        {getInputModeLabel(row.getValue("inputMode"))}
                    </Badge>
                ),
            },
            {
                id: "status",
                header: "進捗",
                cell: ({ row }) => {
                    const { label, className } = getStatusMeta(row.original);
                    return (
                        <Badge variant="outline" className={cn("bg-white", className)}>
                            {label}
                        </Badge>
                    );
                },
            },
            {
                id: "actions",
                header: "操作",
                cell: ({ row }) => {
                    const customer = row.original;
                    const isDownloading = downloadingId === customer.id;
                    return (
                        <div className="flex items-center justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    void handleDownloadPdf(customer);
                                }}
                                disabled={isDownloading}
                            >
                                {isDownloading ? "生成中..." : "PDF"}
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setDeleteId(customer.id);
                                }}
                            >
                                削除
                            </Button>
                        </div>
                    );
                },
            },
        ],
        [downloadingId, handleCopyEmail, handleDownloadPdf]
    );

    const table = useReactTable({
        data: customers,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const pageStart = total === 0 ? 0 : pageIndex * pageSize + 1;
    const pageEnd = total === 0 ? 0 : Math.min(total, pageIndex * pageSize + customers.length);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <Input
                    placeholder="顧客名・メール・電話で検索"
                    value={search}
                    onChange={(event) => {
                        hasInteractedRef.current = true;
                        setSearch(event.target.value);
                        setPageIndex(0);
                    }}
                    className="max-w-xs"
                />
                <div className="text-xs text-muted-foreground">
                    {isLoading ? "検索中..." : `${pageStart}-${pageEnd} / ${total}件`}
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border bg-white">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="px-4">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <Spinner />
                                        検索中...
                                    </span>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    onClick={() => router.push(`/admin/customers/${row.original.id}`)}
                                    className="cursor-pointer hover:bg-muted/40"
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-4">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    まだ顧客データがありません。
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                <div>
                    {pageStart}-{pageEnd} / {total}件
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            hasInteractedRef.current = true;
                            setPageIndex((prev) => Math.max(prev - 1, 0));
                        }}
                        disabled={pageIndex === 0 || isLoading}
                    >
                        前へ
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            hasInteractedRef.current = true;
                            setPageIndex((prev) => Math.min(prev + 1, pageCount - 1));
                        }}
                        disabled={pageIndex + 1 >= pageCount || isLoading}
                    >
                        次へ
                    </Button>
                </div>
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
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={saving}
                            className="bg-destructive text-destructive-foreground"
                        >
                            {saving ? "削除中..." : "削除する"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
