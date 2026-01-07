"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Config {
    key: string;
    value: string;
    description: string | null;
}

export default function AdminConfigPage() {
    const router = useRouter();
    const [configs, setConfigs] = useState<Config[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const getUnitForKey = (key: string) => {
        if (key === "annual_interest_rate" || key === "repayment_interest_rate" || key === "dti_ratio") {
            return "%";
        }
        if (
            key === "unit_price_per_tsubo" ||
            key === "technostructure_unit_price_increase" ||
            key === "insulation_unit_price_increase" ||
            key === "demolition_cost" ||
            key === "default_land_cost" ||
            key === "misc_cost"
        ) {
            return "万円";
        }
        return "";
    };

    const getStepForKey = (key: string) => {
        if (
            key === "annual_interest_rate" ||
            key === "repayment_interest_rate" ||
            key === "dti_ratio" ||
            key === "unit_price_per_tsubo" ||
            key === "technostructure_unit_price_increase" ||
            key === "insulation_unit_price_increase"
        ) {
            return "0.1";
        }
        return "1";
    };

    return (
        <div className="container mx-auto max-w-2xl space-y-8 p-6">
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

            <Card>
                <CardHeader>
                    <CardTitle>設定項目</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {loading ? (
                        <div className="text-center">読み込み中...</div>
                    ) : (
                        <>
                            {configs.map((config) => (
                                <div key={config.key} className="space-y-2">
                                    <Label htmlFor={config.key}>
                                        {config.description}
                                    </Label>
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
                            ))}
                        </>
                    )}

                    <div className="flex justify-end space-x-4 pt-6">
                        <Button asChild variant="outline">
                            <Link href="/admin">キャンセル</Link>
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? "保存中..." : "保存"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
