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
    const customerId = typeof params?.customerId === "string" ? params.customerId : undefined;
    const allowNewEntry = params?.newEntry === "true";
    const draftName = typeof params?.draftName === "string" ? params.draftName : undefined;

    return (
        <InPersonFormMain
            prefillConsent={prefillConsent}
            initialCustomerId={customerId}
            initialAllowNewEntry={allowNewEntry}
            initialDraftName={draftName}
        />
    );
}
