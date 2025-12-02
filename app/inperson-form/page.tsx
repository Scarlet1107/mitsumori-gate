/**
 * InPersonForm ページ - リファクタリング版
 */

import InPersonFormMain from "./components/InPersonFormMain";

export const dynamic = "force-dynamic";

interface InPersonFormPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InPersonFormPage({ searchParams }: InPersonFormPageProps) {
    const params = await searchParams;
    const prefillConsent = params?.consent === "true";

    return <InPersonFormMain prefillConsent={prefillConsent} />;
}
