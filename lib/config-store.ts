import { prisma } from "@/lib/prisma";
import { AppConfig } from "./generated/prisma";

// 初期設定値
const DEFAULT_CONFIGS = [
    {
        key: "annual_interest_rate",
        value: "1.5",
        description: "年利率（%）",
    },
    {
        key: "dti_ratio",
        value: "35",
        description: "DTI比率（%）",
    },
    {
        key: "unit_price_per_tsubo",
        value: "70",
        description: "坪単価（万円）",
    },
] as const;

export interface ConfigValue {
    key: string;
    value: string;
    description: string | null;
}

// 全設定値を取得
export async function getAllConfigs(): Promise<ConfigValue[]> {
    return await prisma.appConfig.findMany({
        select: {
            key: true,
            value: true,
            description: true,
        },
        orderBy: {
            key: "asc",
        },
    });
}

// 特定の設定値を取得
export async function getConfig(key: string): Promise<string | null> {
    const config = await prisma.appConfig.findUnique({
        where: { key },
        select: { value: true },
    });
    return config?.value || null;
}

// 設定値を更新（存在しない場合は作成）
export async function upsertConfig(
    key: string,
    value: string,
    description?: string
): Promise<AppConfig> {
    return await prisma.appConfig.upsert({
        where: { key },
        create: {
            key,
            value,
            description,
        },
        update: {
            value,
            description,
        },
    });
}

// 初期設定値をセットアップ
export async function seedDefaultConfigs(): Promise<void> {
    for (const config of DEFAULT_CONFIGS) {
        await upsertConfig(config.key, config.value, config.description);
    }
}

// 型安全な設定値取得
export async function getTypedConfigs() {
    try {
        let configs = await getAllConfigs();

        // 設定が空の場合は初期値をセットアップ
        if (configs.length === 0) {
            console.log("No configs found, seeding defaults...");
            await seedDefaultConfigs();
            configs = await getAllConfigs();
        }

        const configMap = new Map(configs.map(c => [c.key, c.value]));

        return {
            annualInterestRate: parseFloat(configMap.get("annual_interest_rate") || "1.5"),
            dtiRatio: parseFloat(configMap.get("dti_ratio") || "35"),
            unitPricePerTsubo: parseInt(configMap.get("unit_price_per_tsubo") || "70"),
        };
    } catch (error) {
        console.error("Error getting configs:", error);
        // エラーの場合はデフォルト値を返す
        return {
            annualInterestRate: 1.5,
            dtiRatio: 35,
            unitPricePerTsubo: 70,
        };
    }
}
