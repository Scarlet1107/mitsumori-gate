/**
 * CustomerSearchField - 顧客検索フィールドコンポーネント
 */

import { RefObject } from "react";
import { Input } from "@/components/ui/input";
import { SearchResults } from "@/components/form/FormFields";
import type { CustomerSearchResult } from "@/lib/inperson-form-config";

interface CustomerSearchFieldProps {
    searchQuery: string;
    searchResults: CustomerSearchResult[];
    searchLoading: boolean;
    recentCustomers: CustomerSearchResult[];
    isSearching: boolean;
    onSearch: (query: string) => void;
    onCustomerSelect: (customer: CustomerSearchResult) => void;
    placeholder?: string;
    error: string | null;
    inputRef: RefObject<HTMLInputElement>;
}

/**
 * 顧客検索機能付きの入力フィールド
 * 
 * 名前やメールアドレスで既存顧客を検索し、
 * データを自動入力できる
 */
export function CustomerSearchField({
    searchQuery,
    searchResults,
    searchLoading,
    recentCustomers,
    isSearching,
    onSearch,
    onCustomerSelect,
    placeholder,
    error,
    inputRef,
}: CustomerSearchFieldProps) {

    const formatDisplayDate = (isoDate?: string) => {
        if (!isoDate) return undefined;
        const parsed = new Date(isoDate);
        if (isNaN(parsed.getTime())) return undefined;
        const year = parsed.getFullYear();
        const month = parsed.getMonth() + 1;
        const day = parsed.getDate();
        return `${year}年${month}月${day}日`;
    };

    const handleInputChange = (value: string) => {
        onSearch(value);
    };

    // 表示する検索結果を決定
    const displayResults = isSearching && searchQuery.trim()
        ? searchResults
        : recentCustomers;

    return (
        <div className="space-y-4">
            {/* 検索入力フィールド */}
            <div className="space-y-2">
                <Input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={placeholder || "お名前またはメールアドレス"}
                    className="text-base sm:text-lg h-12 sm:h-14 rounded-xl"
                />
                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}
            </div>

            {/* 検索結果表示 */}
            <SearchResults
                results={displayResults.map(customer => ({
                    id: customer.id,
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    meta: formatDisplayDate(customer.createdAt),
                }))}
                onSelect={(selectedCustomer) => {
                    // 元の顧客データを復元して渡す
                    const fullCustomer = displayResults.find(c => c.id === selectedCustomer.id);
                    if (fullCustomer) {
                        onCustomerSelect(fullCustomer);
                    }
                }}
                loading={searchLoading}
                emptyQuery={!isSearching && recentCustomers.length === 0}
            />

            {/* 検索状態の説明 */}
            {!isSearching && recentCustomers.length > 0 && (
                <p className="text-sm text-gray-500">
                    最近の顧客一覧です。検索するか、下記から選択してください。
                </p>
            )}

            {isSearching && searchQuery.trim() && searchResults.length === 0 && !searchLoading && (
                <p className="text-sm text-gray-500">
                    該当する顧客が見つかりませんでした。新規で入力してください。
                </p>
            )}
        </div>
    );
}
