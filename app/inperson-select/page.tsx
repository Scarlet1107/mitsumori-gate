"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { useInPersonFormCustomerSearch } from "@/app/inperson-form/components/hooks/useInPersonFormCustomerSearch";
import { CustomerSearchField } from "@/app/inperson-form/components/CustomerSearchField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDataKey, getHistoryKey, getProgressKey } from "@/lib/form-types";
import type { CustomerSearchResult } from "@/lib/form-types";

export default function InPersonSelectPage() {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null!);
    const [draftName, setDraftName] = useState("");

    const {
        searchQuery,
        searchResults,
        searchLoading,
        recentCustomers,
        isSearching,
        isLoadingRecent,
        handleSearch,
        handleCustomerSelect,
        clearSearch,
    } = useInPersonFormCustomerSearch({
        onCustomerSelected: handleSelection,
    });

    function handleSelection(customer: CustomerSearchResult) {
        const params = new URLSearchParams();
        params.set("mode", "inperson");
        params.set("customerId", customer.id);
        router.push(`/cover?${params.toString()}`);
    }

    const handleDraftNameChange = useCallback((value: string) => {
        setDraftName(value);
    }, []);

    const handleNewEntry = () => {
        const dataKey = getDataKey("inperson");
        const progressKey = getProgressKey("inperson");
        const historyKey = getHistoryKey("inperson");
        localStorage.removeItem(dataKey);
        localStorage.removeItem(progressKey);
        localStorage.removeItem(historyKey);
        document.cookie = `${dataKey}=; path=/; max-age=0`;
        document.cookie = `${progressKey}=; path=/; max-age=0`;
        document.cookie = `${historyKey}=; path=/; max-age=0`;
        const params = new URLSearchParams();
        params.set("mode", "inperson");
        params.set("newEntry", "true");
        if (draftName.trim()) {
            params.set("draftName", draftName.trim());
        }
        router.push(`/cover?${params.toString()}`);
        clearSearch();
    };

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-12 text-foreground bg-gradient-to-b from-slate-50 via-white to-slate-100">
            <header className="space-y-3 text-center">
                <div className="flex flex-col items-center gap-3">
                    <Image
                        src="/logo1.png"
                        alt="Logo"
                        width={180}
                        height={30}
                        draggable={false}
                        className="pointer-events-none select-none"
                    />
                    <p className="text-sm font-semibold text-muted-foreground">
                        対面シミュレーション
                    </p>
                </div>
            </header>

            <Card className="border-slate-200/70 shadow-lg/10">
                <CardHeader className="space-y-2 text-center">
                    <CardTitle className="text-2xl sm:text-3xl">
                        お客様の選択
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed text-muted-foreground">
                        既存のお客様を検索するか、新規受付として進めます。
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <CustomerSearchField
                        searchQuery={searchQuery}
                        searchResults={searchResults}
                        searchLoading={searchLoading}
                        recentCustomers={recentCustomers}
                        isSearching={isSearching}
                        isLoadingRecent={isLoadingRecent}
                        onSearch={handleSearch}
                        onCustomerSelect={handleCustomerSelect}
                        onDraftNameChange={handleDraftNameChange}
                        placeholder="例）山田太郎 または yamada@example.com"
                        error={null}
                        inputRef={inputRef}
                    />

                    <div className="flex items-center justify-between">
                        <Button type="button" variant="ghost" asChild className="rounded-full px-4">
                            <Link href="/">戻る</Link>
                        </Button>
                        <Button type="button" variant="outline" onClick={handleNewEntry} className="rounded-full">
                            新規受付で進める
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
