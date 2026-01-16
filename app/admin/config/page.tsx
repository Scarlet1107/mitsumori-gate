"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BASE_CONFIG_ORDER, sortBaseConfigs, sortUnitPriceConfigs, type BaseConfigKey } from "@/lib/config-order";
import { getConfigMeta, isUnitPriceTierKey, UNIT_PRICE_TIER_METADATA, type ConfigKey, type UnitPriceTierKey } from "@/lib/config-metadata";

interface Config {
    key: ConfigKey;
    value: string;
    description: string | null;
}

export default function AdminConfigPage() {
    const router = useRouter();
    const [configs, setConfigs] = useState<Config[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const orderedBaseConfigs = useMemo(() => {
        const baseConfigs = configs.filter((config): config is Config & { key: BaseConfigKey } =>
            BASE_CONFIG_ORDER.includes(config.key as BaseConfigKey)
        );
        return sortBaseConfigs(baseConfigs);
    }, [configs]);
    const orderedUnitPriceConfigs = useMemo(() => {
        const tierConfigs = configs.filter((config): config is Config & { key: UnitPriceTierKey } =>
            isUnitPriceTierKey(config.key)
        );
        return sortUnitPriceConfigs(tierConfigs);
    }, [configs]);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const response = await fetch("/api/admin/config");
            if (!response.ok) throw new Error("設定値の取得に失敗しました");
            const data = await response.json();
            setConfigs(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    const handleValueChange = (key: string, value: string) => {
        setConfigs(prev =>
            prev.map(config =>
                config.key === key ? { ...config, value } : config
            )
        );
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);

        try {
            const response = await fetch("/api/admin/config", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ configs }),
            });

            if (!response.ok) throw new Error("設定値の保存に失敗しました");

            router.push("/admin");
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setSaving(false);
        }
    };

    const getUnitForKey = (key: ConfigKey) => getConfigMeta(key)?.unit ?? "";
    const getStepForKey = (key: ConfigKey) => getConfigMeta(key)?.step ?? "1";

    return (
        <div className="container mx-auto max-w-5xl space-y-8 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">設定値管理</h1>
                    <p className="text-muted-foreground">
                        計算に使用される設定値を編集できます。
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/admin">戻る</Link>
                </Button>
            </div>

            {error && (
                <Card className="border-destructive bg-destructive/10">
                    <CardContent className="pt-6">
                        <p className="text-destructive font-medium">{error}</p>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>設定項目</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {loading ? (
                            <div className="text-center">読み込み中...</div>
                        ) : (
                            <>
                                {orderedBaseConfigs.map((config) => {
                                    const meta = getConfigMeta(config.key);
                                    const labelText = meta?.description ?? config.description ?? config.key;
                                    const helpText = meta?.help;
                                    return (
                                        <div key={config.key} className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor={config.key}>
                                                    {labelText}
                                                </Label>
                                                {helpText ? (
                                                    <HoverCard openDelay={150}>
                                                        <HoverCardTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className="inline-flex items-center text-muted-foreground transition hover:text-foreground"
                                                                aria-label={`${labelText}の説明`}
                                                            >
                                                                <HelpCircle className="size-4" />
                                                            </button>
                                                        </HoverCardTrigger>
                                                        <HoverCardContent className="w-72 text-sm leading-relaxed">
                                                            {helpText}
                                                        </HoverCardContent>
                                                    </HoverCard>
                                                ) : null}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    id={config.key}
                                                    type="number"
                                                    step={getStepForKey(config.key)}
                                                    value={config.value}
                                                    onChange={(e) => handleValueChange(config.key, e.target.value)}
                                                    className="max-w-xs"
                                                />
                                                <span className="text-sm text-muted-foreground">
                                                    {getUnitForKey(config.key)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}

                    </CardContent>
                </Card>

                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>坪単価設定</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            施工面積の上限ごとに適用する坪単価を設定します。
                        </p>
                        <div className="overflow-hidden rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>施工面積（坪）</TableHead>
                                        <TableHead>総額（万円）</TableHead>
                                        <TableHead>坪単価（万円）</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {UNIT_PRICE_TIER_METADATA.map((meta) => {
                                        if (loading) {
                                            return (
                                                <TableRow key={meta.key}>
                                                    <TableCell className="font-medium">〜{meta.maxTsubo}</TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-5 w-20" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-9 w-[140px]" />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        }

                                        const config = orderedUnitPriceConfigs.find((item) => item.key === meta.key);
                                        const value = config?.value ?? meta.defaultValue;
                                        const numericValue = Number(value);
                                        const maxBudget = Number.isFinite(numericValue)
                                            ? Math.round(numericValue * meta.maxTsubo)
                                            : 0;
                                        return (
                                            <TableRow key={meta.key}>
                                                <TableCell className="font-medium">〜{meta.maxTsubo}</TableCell>
                                                <TableCell>〜{maxBudget}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            id={meta.key}
                                                            type="number"
                                                            step={meta.step ?? "0.1"}
                                                            value={value}
                                                            onChange={(e) => handleValueChange(meta.key, e.target.value)}
                                                            className="max-w-[140px]"
                                                        />
                                                        <span className="text-xs text-muted-foreground">
                                                            {meta.unit ?? "万円"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end space-x-4">
                <Button asChild variant="outline">
                    <Link href="/admin">キャンセル</Link>
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? "保存中..." : "保存"}
                </Button>
            </div>
        </div>
    );
}
