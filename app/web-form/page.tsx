/**
 * WebForm ページ - リファクタリング版
 */

import WebFormMain from "./components/WebFormMain";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface WebFormPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function WebFormPage({ searchParams }: WebFormPageProps) {
    const params = await searchParams;
    const consent = params?.consent === "true";

    if (!consent) {
        redirect("/consent?mode=web");
    }

    return <WebFormMain />;
}
