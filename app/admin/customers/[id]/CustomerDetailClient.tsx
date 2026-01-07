"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { formatManWithOku } from "@/lib/format";
import { Loader2 } from "lucide-react";

interface SimulationSnapshot {
    id: string;
    createdAt: string;
    wishLoanAmount?: number | null;
    totalBudget?: number | null;
}

interface CustomerDetailPayload {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    name: string;
    email?: string | null;
    phone?: string | null;
    inputMode?: string | null;
    postalCode?: string | null;
    baseAddress?: string | null;
    detailAddress?: string | null;
    age?: number | null;
    hasSpouse?: boolean | null;
    spouseName?: string | null;
    spouseAge?: number | null;
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
    hasExistingBuilding?: boolean | null;
    hasLandBudget?: boolean | null;
    landBudget?: number | null;
    usesTechnostructure?: boolean | null;
    webCompleted: boolean;
    inPersonCompleted: boolean;
    simulations?: SimulationSnapshot[];
}

interface CustomerFormState {
    name: string;
    email: string;
    phone: string;
    postalCode: string;
    baseAddress: string;
    detailAddress: string;
    age: string;
    hasSpouse: boolean;
    spouseName: string;
    spouseAge: string;
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
    hasExistingBuilding: boolean;
    hasLandBudget: boolean;
    landBudget: string;
    usesTechnostructure: boolean;
    webCompleted: boolean;
    inPersonCompleted: boolean;
}

const toStringValue = (value?: number | null) => {
    if (value === null || value === undefined) return "";
    return String(value);
};

const toBooleanValue = (value?: boolean | null) => value ?? false;

const toOptionalNumber = (value: string) => {
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};

const formatDateTime = (value: string) => {
    try {
        return new Date(value).toLocaleString("ja-JP");
    } catch {
        return value;
    }
};

const toFormState = (customer: CustomerDetailPayload): CustomerFormState => ({
    name: customer.name ?? "",
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    postalCode: customer.postalCode ?? "",
    baseAddress: customer.baseAddress ?? "",
    detailAddress: customer.detailAddress ?? "",
    age: toStringValue(customer.age),
    hasSpouse: toBooleanValue(customer.hasSpouse),
    spouseName: customer.spouseName ?? "",
    spouseAge: toStringValue(customer.spouseAge),
    ownIncome: toStringValue(customer.ownIncome),
    spouseIncome: toStringValue(customer.spouseIncome),
    ownLoanPayment: toStringValue(customer.ownLoanPayment),
    spouseLoanPayment: toStringValue(customer.spouseLoanPayment),
    downPayment: toStringValue(customer.downPayment),
    wishMonthlyPayment: toStringValue(customer.wishMonthlyPayment),
    wishPaymentYears: toStringValue(customer.wishPaymentYears),
    usesBonus: toBooleanValue(customer.usesBonus),
    bonusPayment: toStringValue(customer.bonusPayment),
    hasLand: toBooleanValue(customer.hasLand),
    hasExistingBuilding: toBooleanValue(customer.hasExistingBuilding),
    hasLandBudget: toBooleanValue(customer.hasLandBudget),
    landBudget: toStringValue(customer.landBudget),
    usesTechnostructure: toBooleanValue(customer.usesTechnostructure),
    webCompleted: customer.webCompleted,
    inPersonCompleted: customer.inPersonCompleted,
});

export function AdminCustomerDetail({ customer }: { customer: CustomerDetailPayload }) {
    const [savedCustomer, setSavedCustomer] = useState(customer);
    const [form, setForm] = useState(() => toFormState(customer));
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const fullAddress = useMemo(() => {
        const base = form.baseAddress.trim();
        const detail = form.detailAddress.trim();
        return `${base}${detail}`.trim();
    }, [form.baseAddress, form.detailAddress]);

    const handleFieldChange = (field: keyof CustomerFormState, value: string | boolean) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setForm(toFormState(savedCustomer));
        setIsEditing(false);
        setActionMessage(null);
    };

    const buildUpdatePayload = () => {
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
            spouseAge: form.hasSpouse ? toOptionalNumber(form.spouseAge) : undefined,
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
            hasExistingBuilding: form.hasExistingBuilding,
            hasLandBudget: form.hasLandBudget,
            landBudget: form.hasLandBudget ? toOptionalNumber(form.landBudget) : undefined,
            usesTechnostructure: form.usesTechnostructure,
            webCompleted: form.webCompleted,
            inPersonCompleted: form.inPersonCompleted,
        };
    };

    const applyFormToCustomer = (prev: CustomerDetailPayload, updatedAt: string) => ({
        ...prev,
        updatedAt,
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        postalCode: form.postalCode || null,
        baseAddress: form.baseAddress || null,
        detailAddress: form.detailAddress || null,
        age: toOptionalNumber(form.age) ?? null,
        hasSpouse: form.hasSpouse,
        spouseName: form.hasSpouse ? (form.spouseName || null) : null,
        spouseAge: form.hasSpouse ? (toOptionalNumber(form.spouseAge) ?? null) : null,
        ownIncome: toOptionalNumber(form.ownIncome) ?? null,
        spouseIncome: form.hasSpouse ? (toOptionalNumber(form.spouseIncome) ?? null) : null,
        ownLoanPayment: toOptionalNumber(form.ownLoanPayment) ?? null,
        spouseLoanPayment: form.hasSpouse ? (toOptionalNumber(form.spouseLoanPayment) ?? null) : null,
        downPayment: toOptionalNumber(form.downPayment) ?? null,
        wishMonthlyPayment: toOptionalNumber(form.wishMonthlyPayment) ?? null,
        wishPaymentYears: toOptionalNumber(form.wishPaymentYears) ?? null,
        usesBonus: form.usesBonus,
        bonusPayment: form.usesBonus ? (toOptionalNumber(form.bonusPayment) ?? 0) : 0,
        hasLand: form.hasLand,
        hasExistingBuilding: form.hasExistingBuilding,
        hasLandBudget: form.hasLandBudget,
        landBudget: form.hasLandBudget ? (toOptionalNumber(form.landBudget) ?? null) : null,
        usesTechnostructure: form.usesTechnostructure,
        webCompleted: form.webCompleted,
        inPersonCompleted: form.inPersonCompleted,
    });

    const handleSave = async () => {
        setSaving(true);
        setActionMessage(null);
        try {
            const response = await fetch(`/api/customers/${customer.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(buildUpdatePayload()),
            });

            if (!response.ok) {
                throw new Error("顧客情報の更新に失敗しました");
            }

            const data = await response.json();
            const updatedAt = data.updatedAt ?? new Date().toISOString();
            setSavedCustomer(prev => applyFormToCustomer(prev, updatedAt));
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            setActionMessage(error instanceof Error ? error.message : "更新に失敗しました");
        } finally {
            setSaving(false);
        }
    };

    const canEdit = !savedCustomer.deletedAt;

    return (
        <div className="container mx-auto max-w-6xl space-y-6 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">顧客詳細</h1>
                        {savedCustomer.deletedAt && (
                            <Badge variant="destructive">削除済み</Badge>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>顧客ID:</span>
                        <span className="font-mono text-xs">{savedCustomer.id}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>登録: {formatDateTime(savedCustomer.createdAt)}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>更新: {formatDateTime(savedCustomer.updatedAt)}</span>
                    </div>
                    {savedCustomer.deletedAt && (
                        <p className="text-sm text-muted-foreground">
                            削除日時: {formatDateTime(savedCustomer.deletedAt)}
                        </p>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline">
                        <Link href="/admin">一覧に戻る</Link>
                    </Button>
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={resetForm} disabled={saving}>
                                キャンセル
                            </Button>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        保存中...
                                    </span>
                                ) : (
                                    "保存"
                                )}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)} disabled={!canEdit}>
                            編集
                        </Button>
                    )}
                </div>
            </div>

            {actionMessage && (
                <p className="text-sm text-red-600">{actionMessage}</p>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>基本情報</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs">お名前</Label>
                                <Input value={form.name} disabled={!isEditing} onChange={e => handleFieldChange("name", e.target.value)} />
                            </div>
                            <div>
                                <Label className="text-xs">年齢</Label>
                                <Input value={form.age} disabled={!isEditing} onChange={e => handleFieldChange("age", e.target.value)} />
                            </div>
                            <div>
                                <Label className="text-xs">メールアドレス</Label>
                                <Input value={form.email} disabled={!isEditing} onChange={e => handleFieldChange("email", e.target.value)} />
                            </div>
                            <div>
                                <Label className="text-xs">電話番号</Label>
                                <Input value={form.phone} disabled={!isEditing} onChange={e => handleFieldChange("phone", e.target.value)} />
                            </div>
                            <div>
                                <Label className="text-xs">入力方式</Label>
                                <Input
                                    value={savedCustomer.inputMode === "web"
                                        ? "Web入力"
                                        : savedCustomer.inputMode === "inperson"
                                            ? "対面入力"
                                            : "-"}
                                    disabled
                                />
                            </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                <span className="text-sm">配偶者あり</span>
                                <Switch checked={form.hasSpouse} disabled={!isEditing} onCheckedChange={checked => handleFieldChange("hasSpouse", checked)} />
                            </div>
                            <div>
                                <Label className="text-xs">配偶者氏名</Label>
                                <Input
                                    value={form.spouseName}
                                    disabled={!isEditing || !form.hasSpouse}
                                    onChange={e => handleFieldChange("spouseName", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="text-xs">配偶者年齢</Label>
                                <Input
                                    value={form.spouseAge}
                                    disabled={!isEditing || !form.hasSpouse}
                                    onChange={e => handleFieldChange("spouseAge", e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>住所</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-xs">郵便番号</Label>
                            <Input value={form.postalCode} disabled={!isEditing} onChange={e => handleFieldChange("postalCode", e.target.value)} />
                        </div>
                        <div>
                            <Label className="text-xs">基本住所</Label>
                            <Input value={form.baseAddress} disabled={!isEditing} onChange={e => handleFieldChange("baseAddress", e.target.value)} />
                        </div>
                        <div>
                            <Label className="text-xs">詳細住所</Label>
                            <Input value={form.detailAddress} disabled={!isEditing} onChange={e => handleFieldChange("detailAddress", e.target.value)} />
                        </div>
                        <div>
                            <Label className="text-xs">結合住所</Label>
                            <Input value={fullAddress || "-"} disabled />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>収入・借入</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs">年収（本人）</Label>
                                <Input value={form.ownIncome} disabled={!isEditing} onChange={e => handleFieldChange("ownIncome", e.target.value)} />
                            </div>
                            <div>
                                <Label className="text-xs">既存借入（本人）</Label>
                                <Input value={form.ownLoanPayment} disabled={!isEditing} onChange={e => handleFieldChange("ownLoanPayment", e.target.value)} />
                            </div>
                            <div>
                                <Label className="text-xs">年収（配偶者）</Label>
                                <Input
                                    value={form.spouseIncome}
                                    disabled={!isEditing || !form.hasSpouse}
                                    onChange={e => handleFieldChange("spouseIncome", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="text-xs">既存借入（配偶者）</Label>
                                <Input
                                    value={form.spouseLoanPayment}
                                    disabled={!isEditing || !form.hasSpouse}
                                    onChange={e => handleFieldChange("spouseLoanPayment", e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>返済条件</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs">自己資金</Label>
                                <Input value={form.downPayment} disabled={!isEditing} onChange={e => handleFieldChange("downPayment", e.target.value)} />
                            </div>
                            <div>
                                <Label className="text-xs">希望月返済額</Label>
                                <Input value={form.wishMonthlyPayment} disabled={!isEditing} onChange={e => handleFieldChange("wishMonthlyPayment", e.target.value)} />
                            </div>
                            <div>
                                <Label className="text-xs">希望返済年数</Label>
                                <Input value={form.wishPaymentYears} disabled={!isEditing} onChange={e => handleFieldChange("wishPaymentYears", e.target.value)} />
                            </div>
                            <div>
                                <Label className="text-xs">ボーナス支払い額（1回分）</Label>
                                <Input
                                    value={form.bonusPayment}
                                    disabled={!isEditing || !form.usesBonus}
                                    onChange={e => handleFieldChange("bonusPayment", e.target.value)}
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                <span className="text-sm">ボーナス返済</span>
                                <Switch checked={form.usesBonus} disabled={!isEditing} onCheckedChange={checked => handleFieldChange("usesBonus", checked)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>その他条件</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                <span className="text-sm">土地所有</span>
                                <Switch checked={form.hasLand} disabled={!isEditing} onCheckedChange={checked => handleFieldChange("hasLand", checked)} />
                            </div>
                            <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                <span className="text-sm">既存建物あり</span>
                                <Switch checked={form.hasExistingBuilding} disabled={!isEditing} onCheckedChange={checked => handleFieldChange("hasExistingBuilding", checked)} />
                            </div>
                            <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                <span className="text-sm">土地予算あり</span>
                                <Switch checked={form.hasLandBudget} disabled={!isEditing} onCheckedChange={checked => handleFieldChange("hasLandBudget", checked)} />
                            </div>
                            <div>
                                <Label className="text-xs">土地予算</Label>
                                <Input
                                    value={form.landBudget}
                                    disabled={!isEditing || !form.hasLandBudget}
                                    onChange={e => handleFieldChange("landBudget", e.target.value)}
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                <span className="text-sm">テクノストラクチャー</span>
                                <Switch checked={form.usesTechnostructure} disabled={!isEditing} onCheckedChange={checked => handleFieldChange("usesTechnostructure", checked)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>入力状況</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                <span className="text-sm">Web入力完了</span>
                                <Switch checked={form.webCompleted} disabled={!isEditing} onCheckedChange={checked => handleFieldChange("webCompleted", checked)} />
                            </div>
                            <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                <span className="text-sm">対面入力完了</span>
                                <Switch checked={form.inPersonCompleted} disabled={!isEditing} onCheckedChange={checked => handleFieldChange("inPersonCompleted", checked)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>シミュレーション履歴</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {savedCustomer.simulations && savedCustomer.simulations.length > 0 ? (
                        savedCustomer.simulations.map(sim => (
                            <div key={sim.id} className="rounded-md border p-3">
                                <p className="text-xs text-muted-foreground">{formatDateTime(sim.createdAt)}</p>
                                <p className="text-sm">借入金額: {sim.wishLoanAmount ? formatManWithOku(sim.wishLoanAmount) : "-"}</p>
                                <p className="text-sm">総予算: {sim.totalBudget ? formatManWithOku(sim.totalBudget) : "-"}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">シミュレーション履歴はありません。</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
