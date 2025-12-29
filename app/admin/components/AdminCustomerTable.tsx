"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatManWithOku } from "@/lib/format";
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

interface SimulationSnapshot {
    id: string;
    createdAt: string;
    wishLoanAmount?: number | null;
    totalBudget?: number | null;
}

interface CustomerDetail extends CustomerRow {
    postalCode?: string | null;
    baseAddress?: string | null;
    detailAddress?: string | null;
    address?: string | null;
    age?: number | null;
    hasSpouse?: boolean | null;
    spouseName?: string | null;
    ownIncome?: number | null;
    spouseIncome?: number | null;
    ownLoanPayment?: number | null;
    spouseLoanPayment?: number | null;
    downPayment?: number | null;
    wishMonthlyPayment?: number | null;
    wishPaymentYears?: number | null;
    usesBonus?: boolean | null;
    bonusPayment?: number | null;
    hasLand?: boolean | null;
    usesTechnostructure?: boolean | null;
    simulations?: SimulationSnapshot[];
}

interface AdminCustomerTableProps {
    initialCustomers: CustomerRow[];
}

interface EditFormState {
    id: string;
    name: string;
    email: string;
    phone: string;
    postalCode: string;
    baseAddress: string;
    detailAddress: string;
    age: string;
    hasSpouse: boolean;
    spouseName: string;
    ownIncome: string;
    spouseIncome: string;
    ownLoanPayment: string;
    spouseLoanPayment: string;
    downPayment: string;
    wishMonthlyPayment: string;
    wishPaymentYears: string;
    usesBonus: boolean;
    bonusPayment: string;
    hasLand: boolean;
    usesTechnostructure: boolean;
    webCompleted: boolean;
    inPersonCompleted: boolean;
}

const formatDateTime = (value: string) => {
    try {
        return new Date(value).toLocaleString("ja-JP");
    } catch {
        return value;
    }
};

const toOptionalNumber = (value: string) => {
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};

const toBooleanFromState = (value: boolean | null | undefined) => value ?? false;

export function AdminCustomerTable({ initialCustomers }: AdminCustomerTableProps) {
    const [customers, setCustomers] = useState<CustomerRow[]>(initialCustomers);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detail, setDetail] = useState<CustomerDetail | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState<EditFormState | null>(null);
    const [saving, setSaving] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const resetActionMessage = () => setActionMessage(null);

    const fetchCustomerDetail = useCallback(async (id: string) => {
        const response = await fetch(`/api/customers/${id}`);
        if (!response.ok) {
            throw new Error("顧客情報の取得に失敗しました");
        }
        return await response.json();
    }, []);

    const openDetail = async (id: string) => {
        setDetailOpen(true);
        setDetailLoading(true);
        resetActionMessage();
        try {
            const data = await fetchCustomerDetail(id);
            setDetail(data);
        } catch (error) {
            console.error(error);
            setActionMessage(error instanceof Error ? error.message : "読み込みに失敗しました");
        } finally {
            setDetailLoading(false);
        }
    };

    const startEdit = async (id: string) => {
        resetActionMessage();
        try {
            const data: CustomerDetail = detail && detail.id === id ? detail : await fetchCustomerDetail(id);
            setDetail(data);
            setEditForm({
                id: data.id,
                name: data.name || "",
                email: data.email || "",
                phone: data.phone || "",
                postalCode: data.postalCode || "",
                baseAddress: data.baseAddress || "",
                detailAddress: data.detailAddress || "",
                age: data.age?.toString() || "",
                hasSpouse: toBooleanFromState(data.hasSpouse),
                spouseName: data.spouseName || "",
                ownIncome: data.ownIncome?.toString() || "",
                spouseIncome: data.spouseIncome?.toString() || "",
                ownLoanPayment: data.ownLoanPayment?.toString() || "",
                spouseLoanPayment: data.spouseLoanPayment?.toString() || "",
                downPayment: data.downPayment?.toString() || "",
                wishMonthlyPayment: data.wishMonthlyPayment?.toString() || "",
                wishPaymentYears: data.wishPaymentYears?.toString() || "",
                usesBonus: toBooleanFromState(data.usesBonus),
                bonusPayment: data.bonusPayment?.toString() || "",
                hasLand: toBooleanFromState(data.hasLand),
                usesTechnostructure: toBooleanFromState(data.usesTechnostructure),
                webCompleted: data.webCompleted,
                inPersonCompleted: data.inPersonCompleted,
            });
            setEditOpen(true);
        } catch (error) {
            console.error(error);
            setActionMessage(error instanceof Error ? error.message : "編集データの取得に失敗しました");
        }
    };

    const handleEditFieldChange = (field: keyof EditFormState, value: string | boolean) => {
        setEditForm(prev => prev ? { ...prev, [field]: value } : prev);
    };

    const buildUpdatePayload = (form: EditFormState) => {
        const normalizeBonusPayment = () => {
            const parsed = toOptionalNumber(form.bonusPayment);
            if (!form.usesBonus) {
                return 0;
            }
            return parsed ?? 0;
        };

        return {
            name: form.name || undefined,
            email: form.email || undefined,
            phone: form.phone || undefined,
            postalCode: form.postalCode || undefined,
            baseAddress: form.baseAddress || undefined,
            detailAddress: form.detailAddress || undefined,
            age: toOptionalNumber(form.age),
            hasSpouse: form.hasSpouse,
            spouseName: form.hasSpouse ? (form.spouseName || undefined) : undefined,
            ownIncome: toOptionalNumber(form.ownIncome),
            spouseIncome: form.hasSpouse ? toOptionalNumber(form.spouseIncome) : undefined,
            ownLoanPayment: toOptionalNumber(form.ownLoanPayment),
            spouseLoanPayment: form.hasSpouse ? toOptionalNumber(form.spouseLoanPayment) : undefined,
            downPayment: toOptionalNumber(form.downPayment),
            wishMonthlyPayment: toOptionalNumber(form.wishMonthlyPayment),
            wishPaymentYears: toOptionalNumber(form.wishPaymentYears),
            usesBonus: form.usesBonus,
            bonusPayment: normalizeBonusPayment(),
            hasLand: form.hasLand,
            usesTechnostructure: form.usesTechnostructure,
            webCompleted: form.webCompleted,
            inPersonCompleted: form.inPersonCompleted,
        };
    };

    const handleEditSubmit = async () => {
        if (!editForm) return;
        setSaving(true);
        resetActionMessage();
        try {
            const response = await fetch(`/api/customers/${editForm.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(buildUpdatePayload(editForm)),
            });

            if (!response.ok) {
                throw new Error("顧客情報の更新に失敗しました");
            }

            setCustomers(prev => prev.map(customer => (
                customer.id === editForm.id
                    ? {
                        ...customer,
                        name: editForm.name || customer.name,
                        email: editForm.email || customer.email,
                        phone: editForm.phone || customer.phone,
                        webCompleted: editForm.webCompleted,
                        inPersonCompleted: editForm.inPersonCompleted,
                    }
                    : customer
            )));

            if (detail && detail.id === editForm.id) {
                setDetail(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        name: editForm.name || prev.name,
                        email: editForm.email || prev.email,
                        phone: editForm.phone || prev.phone,
                        postalCode: editForm.postalCode || prev.postalCode,
                        baseAddress: editForm.baseAddress || prev.baseAddress,
                        detailAddress: editForm.detailAddress || prev.detailAddress,
                        address: `${editForm.baseAddress || ""}${editForm.detailAddress || ""}`.trim() || prev.address || "",
                        age: toOptionalNumber(editForm.age) ?? prev.age,
                        hasSpouse: editForm.hasSpouse,
                        spouseName: editForm.hasSpouse ? (editForm.spouseName || prev.spouseName || "") : null,
                        ownIncome: toOptionalNumber(editForm.ownIncome) ?? prev.ownIncome,
                        spouseIncome: editForm.hasSpouse ? (toOptionalNumber(editForm.spouseIncome) ?? prev.spouseIncome) : null,
                        ownLoanPayment: toOptionalNumber(editForm.ownLoanPayment) ?? prev.ownLoanPayment,
                        spouseLoanPayment: editForm.hasSpouse ? (toOptionalNumber(editForm.spouseLoanPayment) ?? prev.spouseLoanPayment) : null,
                        downPayment: toOptionalNumber(editForm.downPayment) ?? prev.downPayment,
                        wishMonthlyPayment: toOptionalNumber(editForm.wishMonthlyPayment) ?? prev.wishMonthlyPayment,
                        wishPaymentYears: toOptionalNumber(editForm.wishPaymentYears) ?? prev.wishPaymentYears,
                        usesBonus: editForm.usesBonus,
                        bonusPayment: editForm.usesBonus ? (toOptionalNumber(editForm.bonusPayment) ?? prev.bonusPayment ?? 0) : 0,
                        hasLand: editForm.hasLand,
                        usesTechnostructure: editForm.usesTechnostructure,
                        webCompleted: editForm.webCompleted,
                        inPersonCompleted: editForm.inPersonCompleted,
                    };
                });
            }

            setEditOpen(false);
        } catch (error) {
            console.error(error);
            setActionMessage(error instanceof Error ? error.message : "更新に失敗しました");
        } finally {
            setSaving(false);
        }
    };

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
            if (detail?.id === deleteId) {
                setDetail(null);
                setDetailOpen(false);
            }
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

    const detailContent = useMemo(() => {
        if (detailLoading) {
            return (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    読み込み中...
                </div>
            );
        }

        if (!detail) {
            return <p className="text-sm text-muted-foreground">顧客情報が見つかりません。</p>;
        }

        return (
            <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground">お名前</p>
                        <p className="font-medium">{detail.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">顧客ID</p>
                        <p className="font-mono text-xs">{detail.id}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground">メール</p>
                        <p>{detail.email || "-"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">電話</p>
                        <p>{detail.phone || "-"}</p>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">住所</p>
                    <p className="text-sm">基本：{detail.baseAddress || "-"}</p>
                    <p className="text-sm">詳細：{detail.detailAddress || "-"}</p>
                    <p className="text-sm font-medium">結合：{detail.address || `${detail.baseAddress ?? ""}${detail.detailAddress ?? ""}` || "-"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground">Web完了</p>
                        <p>{detail.webCompleted ? "済" : "未"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">対面完了</p>
                        <p>{detail.inPersonCompleted ? "済" : "未"}</p>
                    </div>
                </div>

                {detail.simulations && detail.simulations.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">シミュレーション履歴</p>
                        <div className="space-y-2">
                            {detail.simulations.map(sim => (
                                <div key={sim.id} className="rounded border p-2">
                                    <p className="text-xs text-muted-foreground">{formatDateTime(sim.createdAt)}</p>
                                    <p className="text-sm">借入金額: {sim.wishLoanAmount ? formatManWithOku(sim.wishLoanAmount) : "-"}</p>
                                    <p className="text-sm">総予算: {sim.totalBudget ? formatManWithOku(sim.totalBudget) : "-"}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }, [detail, detailLoading]);

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
                                <TableRow
                                    key={customer.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => openDetail(customer.id)}
                                >
                                    <TableCell className="px-6 text-muted-foreground">
                                        {formatDateTime(customer.createdAt)}
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
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openDetail(customer.id); }}>
                                                詳細
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); startEdit(customer.id); }}>
                                                編集
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={downloadingId === customer.id}
                                                onClick={(e) => { e.stopPropagation(); handleDownloadPdf(customer); }}
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
                                            <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteId(customer.id); }}>
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

            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>顧客詳細</DialogTitle>
                        <DialogDescription>
                            顧客の詳細情報とシミュレーション履歴を確認できます。
                        </DialogDescription>
                    </DialogHeader>
                    {detailContent}
                </DialogContent>
            </Dialog>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>顧客情報を編集</DialogTitle>
                        <DialogDescription>
                            入力項目を更新後、保存ボタンを押してください。
                        </DialogDescription>
                    </DialogHeader>
                    {editForm ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs">お名前</Label>
                                    <Input value={editForm.name} onChange={e => handleEditFieldChange("name", e.target.value)} />
                                </div>
                                <div>
                                    <Label className="text-xs">年齢</Label>
                                    <Input value={editForm.age} onChange={e => handleEditFieldChange("age", e.target.value)} />
                                </div>
                                <div>
                                    <Label className="text-xs">メールアドレス</Label>
                                    <Input value={editForm.email} onChange={e => handleEditFieldChange("email", e.target.value)} />
                                </div>
                                <div>
                                    <Label className="text-xs">電話番号</Label>
                                    <Input value={editForm.phone} onChange={e => handleEditFieldChange("phone", e.target.value)} />
                                </div>
                                <div>
                                    <Label className="text-xs">郵便番号</Label>
                                    <Input value={editForm.postalCode} onChange={e => handleEditFieldChange("postalCode", e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-xs">基本住所</Label>
                                    <Input value={editForm.baseAddress} onChange={e => handleEditFieldChange("baseAddress", e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-xs">詳細住所</Label>
                                    <Input value={editForm.detailAddress} onChange={e => handleEditFieldChange("detailAddress", e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs">年収（本人）</Label>
                                    <Input value={editForm.ownIncome} onChange={e => handleEditFieldChange("ownIncome", e.target.value)} />
                                </div>
                                <div>
                                    <Label className="text-xs">既存借入（本人）</Label>
                                    <Input value={editForm.ownLoanPayment} onChange={e => handleEditFieldChange("ownLoanPayment", e.target.value)} />
                                </div>
                                <div className="flex items-center justify-between border rounded-md px-3 py-2">
                                    <span className="text-sm">配偶者あり</span>
                                    <Switch checked={editForm.hasSpouse} onCheckedChange={checked => handleEditFieldChange("hasSpouse", checked)} />
                                </div>
                                {editForm.hasSpouse && (
                                    <div>
                                        <Label className="text-xs">配偶者のお名前</Label>
                                        <Input value={editForm.spouseName} onChange={e => handleEditFieldChange("spouseName", e.target.value)} />
                                    </div>
                                )}
                                {editForm.hasSpouse && (
                                    <>
                                        <div>
                                            <Label className="text-xs">配偶者の年収</Label>
                                            <Input value={editForm.spouseIncome} onChange={e => handleEditFieldChange("spouseIncome", e.target.value)} />
                                        </div>
                                        <div>
                                            <Label className="text-xs">配偶者の既存借入</Label>
                                            <Input value={editForm.spouseLoanPayment} onChange={e => handleEditFieldChange("spouseLoanPayment", e.target.value)} />
                                        </div>
                                    </>
                                )}
                                <div>
                                    <Label className="text-xs">頭金</Label>
                                    <Input value={editForm.downPayment} onChange={e => handleEditFieldChange("downPayment", e.target.value)} />
                                </div>
                                <div>
                                    <Label className="text-xs">希望月返済額</Label>
                                    <Input value={editForm.wishMonthlyPayment} onChange={e => handleEditFieldChange("wishMonthlyPayment", e.target.value)} />
                                </div>
                                <div>
                                    <Label className="text-xs">希望返済年数</Label>
                                    <Input value={editForm.wishPaymentYears} onChange={e => handleEditFieldChange("wishPaymentYears", e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between border rounded-md px-3 py-2">
                                    <span className="text-sm">ボーナス返済</span>
                                    <Switch checked={editForm.usesBonus} onCheckedChange={checked => handleEditFieldChange("usesBonus", checked)} />
                                </div>
                                {editForm.usesBonus && (
                                    <div>
                                        <Label className="text-xs">ボーナス支払い額（1回分）</Label>
                                        <Input value={editForm.bonusPayment} onChange={e => handleEditFieldChange("bonusPayment", e.target.value)} />
                                    </div>
                                )}
                                <div className="flex items-center justify_between border rounded-md px-3 py-2">
                                    <span className="text-sm">土地所有</span>
                                    <Switch checked={editForm.hasLand} onCheckedChange={checked => handleEditFieldChange("hasLand", checked)} />
                                </div>
                                <div className="flex items-center justify-between border rounded-md px-3 py-2">
                                    <span className="text-sm">テクノストラクチャー</span>
                                    <Switch checked={editForm.usesTechnostructure} onCheckedChange={checked => handleEditFieldChange("usesTechnostructure", checked)} />
                                </div>
                                <div className="flex items-center justify-between border rounded-md px-3 py-2">
                                    <span className="text-sm">Web入力完了</span>
                                    <Switch checked={editForm.webCompleted} onCheckedChange={checked => handleEditFieldChange("webCompleted", checked)} />
                                </div>
                                <div className="flex items-center justify-between border rounded-md px-3 py-2">
                                    <span className="text-sm">対面入力完了</span>
                                    <Switch checked={editForm.inPersonCompleted} onCheckedChange={checked => handleEditFieldChange("inPersonCompleted", checked)} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>キャンセル</Button>
                                <Button onClick={handleEditSubmit} disabled={saving}>{saving ? "保存中..." : "保存"}</Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">編集データを読み込んでいます...</p>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>顧客情報を削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                            この操作は取り消せません。本当に削除してよろしいですか？
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
