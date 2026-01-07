import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function AdminLoading() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md">
                <div className="flex items-center justify-center gap-3 p-8">
                    <Spinner className="size-5" />
                    <span className="text-xl">管理画面を読み込み中...</span>
                </div>
            </Card>
        </div>
    );
}
