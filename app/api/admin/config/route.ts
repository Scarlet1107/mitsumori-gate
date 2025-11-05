import { NextResponse } from "next/server";
import { getAllConfigs, upsertConfig } from "@/lib/config-store";

export async function GET() {
    try {
        const configs = await getAllConfigs();
        return NextResponse.json(configs);
    } catch (error) {
        console.error("GET /api/admin/config failed:", error);
        return NextResponse.json(
            { error: "設定値の取得に失敗しました" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const { configs } = await request.json();

        if (!Array.isArray(configs)) {
            return NextResponse.json(
                { error: "不正なデータ形式です" },
                { status: 400 }
            );
        }

        // 各設定値を更新
        for (const config of configs) {
            await upsertConfig(config.key, config.value, config.description);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PUT /api/admin/config failed:", error);
        return NextResponse.json(
            { error: "設定値の保存に失敗しました" },
            { status: 500 }
        );
    }
}
