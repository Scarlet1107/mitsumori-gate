/**
 * フォーム共通のフィールドレンダリングコンポーネント
 */

import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPostalCode, isValidPostalCode } from "@/lib/postal-address";
import { isCurrencyField, isAgeField, getCurrencyUnit } from "@/lib/form-types";
import { Spinner } from "../ui/spinner";

// 全角数字を半角に揃える
function normalizeNumberInput(value: string): string {
    return value
        .replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xFEE0))
        .replace(/．/g, ".")
        .replace(/，/g, ",")
        .replace(/－/g, "-");
}

// 基本入力フィールドの props
interface BaseFieldProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

// テキスト/数値入力フィールド
export const StandardField = forwardRef<HTMLInputElement, BaseFieldProps & {
    type: "text" | "number" | "email" | "tel";
    stepId: string;
}>(({ value, onChange, placeholder, type, stepId, className }, ref) => {
    const isNumberInput = type === "number";
    const inputType = isNumberInput ? "text" : type;
    const inputMode = isNumberInput ? "decimal" : undefined;
    const showCurrencyUnit = type === "number" && (isCurrencyField(stepId) || isAgeField(stepId));

    if (showCurrencyUnit) {
        return (
            <div className="flex items-stretch overflow-hidden rounded-xl border bg-background shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
                <Input
                    ref={ref}
                    type={inputType}
                    value={value}
                    onChange={(e) => {
                        const newValue = isNumberInput ? normalizeNumberInput(e.target.value) : e.target.value;
                        onChange(newValue);
                    }}
                    placeholder={placeholder}
                    inputMode={inputMode}
                    className="border-0 text-base sm:text-lg h-12 sm:h-14 focus-visible:ring-0"
                />
                <span className="flex items-center bg-muted px-3 sm:px-4 text-sm font-medium text-muted-foreground">
                    {getCurrencyUnit(stepId)}
                </span>
            </div>
        );
    }

    return (
        <Input
            ref={ref}
            type={inputType}
            value={value}
            onChange={(e) => {
                const newValue = isNumberInput ? normalizeNumberInput(e.target.value) : e.target.value;
                onChange(newValue);
            }}
            placeholder={placeholder}
            inputMode={inputMode}
            className={className || "text-base sm:text-lg h-12 sm:h-14 rounded-xl"}
        />
    );
});

StandardField.displayName = "StandardField";

// 郵便番号入力フィールド（住所取得機能付き）
export const PostalCodeField = forwardRef<HTMLInputElement, BaseFieldProps & {
    onAddressFetch?: (postalCode: string) => void;
    loading?: boolean;
    fetchedAddress?: string;
}>(({ value, onChange, placeholder, onAddressFetch, loading, fetchedAddress, className }, ref) => {
    const handleChange = (newValue: string) => {
        const formattedValue = formatPostalCode(newValue);
        onChange(formattedValue);

        // 7桁になったら住所を自動取得
        if (isValidPostalCode(formattedValue) && onAddressFetch) {
            onAddressFetch(formattedValue);
        }
    };

    return (
        <div className="space-y-4">
            <Input
                ref={ref}
                type="text"
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder}
                className={className || "text-base sm:text-lg h-12 sm:h-14 rounded-xl"}
            />
            {loading && (
                <div className="text-center text-sm text-muted-foreground">
                    住所を取得中...
                </div>
            )}
            {fetchedAddress && (
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="text-xs text-muted-foreground mb-1">取得した住所</div>
                    <div className="text-sm font-medium">{fetchedAddress}</div>
                </div>
            )}
        </div>
    );
});

PostalCodeField.displayName = "PostalCodeField";

// 詳細住所入力フィールド（対面フォーム用）
export const DetailAddressField = forwardRef<HTMLInputElement, BaseFieldProps & {
    baseAddress?: string;
    loading?: boolean;
    fullAddress?: string;
}>(({ value, onChange, placeholder, baseAddress, loading, fullAddress, className }, ref) => {
    return (
        <div className="space-y-4">
            {/* 基本住所の表示 */}
            {baseAddress && (
                <div className="p-4 bg-muted/50 rounded-xl">
                    <div className="text-sm text-muted-foreground mb-1">郵便番号から取得した住所</div>
                    <div className="font-medium">{baseAddress}</div>
                </div>
            )}

            {loading && (
                <div className="text-center text-sm text-muted-foreground">
                    住所を取得中...
                </div>
            )}

            {/* 詳細住所入力 */}
            <Input
                ref={ref}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={className || "text-base sm:text-lg h-12 sm:h-14 rounded-xl"}
            />

            {/* 完全な住所のプレビュー */}
            {fullAddress && (
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="text-xs text-muted-foreground mb-1">完全な住所</div>
                    <div className="text-sm font-medium">{fullAddress}</div>
                </div>
            )}
        </div>
    );
});

DetailAddressField.displayName = "DetailAddressField";

// はい/いいえボタン
interface QuestionButtonsProps {
    value: boolean | null;
    onChange: (value: boolean) => void;
    onAutoProgress?: (selectedValue?: boolean) => void;
    trueLabel: string;
    falseLabel: string;
    className?: string;
}

export function QuestionButtons({
    value,
    onChange,
    onAutoProgress,
    trueLabel,
    falseLabel,
    className
}: QuestionButtonsProps) {
    const handleClick = (selectedValue: boolean) => {
        // 既に同じ値が選択されている場合は何もしない
        if (value === selectedValue) {
            return;
        }

        onChange(selectedValue);

        // 自動進行（選択された値を渡す）
        if (onAutoProgress) {
            onAutoProgress(selectedValue);
        }
    };

    return (
        <div className={className || "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"}>
            <Button
                type="button"
                variant={value === true ? "default" : "outline"}
                onClick={() => handleClick(true)}
                className="h-12 sm:h-14 text-base sm:text-lg rounded-xl"
            >
                {trueLabel}
            </Button>
            <Button
                type="button"
                variant={value === false ? "default" : "outline"}
                onClick={() => handleClick(false)}
                className="h-12 sm:h-14 text-base sm:text-lg rounded-xl"
            >
                {falseLabel}
            </Button>
        </div>
    );
}

// 検索結果表示（対面フォーム用）
interface Customer {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    meta?: string;
}

interface SearchResultsProps {
    results: Customer[];
    onSelect: (customer: Customer) => void;
    loading?: boolean;
    emptyQuery?: boolean;
}

export function SearchResults({ results, onSelect, loading, emptyQuery }: SearchResultsProps) {
    if (loading || loading === undefined) {
        return (
            <div className="text-center text-md items-center text-muted-foreground space-x-2 flex justify-center">
                <Spinner /><span>検索中... </span>
            </div>
        );
    }

    if (results.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
                {emptyQuery ? "最新の顧客一覧:" : "検索結果:"}
            </p>
            {results.map((customer) => (
                <Button
                    key={customer.id}
                    variant="outline"
                    onClick={() => onSelect(customer)}
                    className="w-full justify-start text-left h-auto p-3 sm:p-4 rounded-xl"
                >
                    <div>
                        <div className="font-medium text-base sm:text-lg">{customer.name}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground flex flex-wrap gap-1">
                            <span>{customer.email || customer.phone || "連絡先未登録"}</span>
                            {customer.meta && (
                                <span className="text-[11px] sm:text-xs text-muted-foreground/80">
                                    {customer.meta}
                                </span>
                            )}
                        </div>
                    </div>
                </Button>
            ))}
        </div>
    );
}

// ローディング表示
interface LoadingDisplayProps {
    message?: string;
}

export function LoadingDisplay({ message = "計算中..." }: LoadingDisplayProps) {
    return (
        <div className="space-y-6 text-center">
            <div className="text-muted-foreground">{message}</div>
        </div>
    );
}

// エラー表示
interface ErrorDisplayProps {
    message?: string;
}

export function ErrorDisplay({ message = "計算できませんでした" }: ErrorDisplayProps) {
    return (
        <div className="space-y-6 text-center">
            <div className="text-muted-foreground">{message}</div>
        </div>
    );
}
