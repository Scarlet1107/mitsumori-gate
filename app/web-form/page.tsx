/**
 * WebForm ページ - リファクタリング版
 */

import WebFormMain from "./components/WebFormMain";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface WebFormPageProps {
    searchParams?: { [key: string]: string | string[] | undefined };
}

export default function WebFormPage({ searchParams }: WebFormPageProps) {
    const consent = searchParams?.consent === "true";

    if (!consent) {
        redirect("/consent?mode=web");
    }

    return <WebFormMain />;
}
