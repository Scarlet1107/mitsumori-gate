/**
 * InPersonForm ページ - リファクタリング版
 */

import InPersonFormMain from "./components/InPersonFormMain";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface InPersonFormPageProps {
    searchParams?: { [key: string]: string | string[] | undefined };
}

export default function InPersonFormPage({ searchParams }: InPersonFormPageProps) {
    const consent = searchParams?.consent === "true";

    if (!consent) {
        redirect("/consent?mode=inperson");
    }

    return <InPersonFormMain />;
}
