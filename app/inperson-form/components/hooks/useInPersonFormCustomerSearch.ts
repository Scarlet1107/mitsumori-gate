/**
 * InPersonForm用の顧客検索フック
 */

import { useState, useCallback, useEffect } from "react";
import type { CustomerSearchResult } from "@/lib/inperson-form-config";

interface UseInPersonFormCustomerSearchProps {
    onCustomerSelected: (customer: CustomerSearchResult) => void;
}

export function useInPersonFormCustomerSearch({
    onCustomerSelected,
}: UseInPersonFormCustomerSearchProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<CustomerSearchResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [recentCustomers, setRecentCustomers] = useState<CustomerSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingRecent, setIsLoadingRecent] = useState(true);

    // 最近の顧客を取得
    useEffect(() => {
        async function fetchRecentCustomers() {
            try {
                const response = await fetch("/api/customers/search");
                if (response.ok) {
                    const data = await response.json();
                    setRecentCustomers(data.customers || []);
                }
            } catch (error) {
                console.warn("Failed to fetch recent customers:", error);
            } finally {
                setIsLoadingRecent(false);
            }
        }

        fetchRecentCustomers();
    }, []);

    // 顧客検索処理
    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);

        if (!query.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setSearchLoading(true);
        setIsSearching(true);

        try {
            const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`);

            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.customers || []);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Customer search error:", error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    }, []);

    // 検索クリア
    const clearSearch = useCallback(() => {
        setSearchQuery("");
        setSearchResults([]);
        setIsSearching(false);
    }, []);

    // 顧客選択処理
    const handleCustomerSelect = useCallback((customer: CustomerSearchResult) => {
        onCustomerSelected(customer);
        clearSearch();
    }, [onCustomerSelected, clearSearch]);

    return {
        searchQuery,
        searchResults,
        searchLoading,
        recentCustomers,
        isSearching,
        isLoadingRecent,
        handleSearch,
        handleCustomerSelect,
        clearSearch,
    };
}
