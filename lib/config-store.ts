import { prisma } from "@/lib/prisma";
import { AppConfig } from "./generated/prisma";

// 初期設定値
const DEFAULT_CONFIGS = [
    {
        key: "annual_interest_rate",
        value: "3",
        description: "審査金利（%）",
    },
    {
        key: "repayment_interest_rate",
        value: "0.8",
        description: "返済金利（%）",
    },
    {
        key: "dti_ratio",
        value: "35",
        description: "DTI比率（%）",
    },
    {
        key: "unit_price_per_tsubo",
        value: "82",
        description: "坪単価（万円）",
    },
    {
        key: "technostructure_unit_price_increase",
        value: "4.8",
        description: "テクノストラクチャー坪単価増加分（万円）",
    },
    {
        key: "insulation_unit_price_increase",
        value: "3",
        description: "付加断熱坪単価増加分（万円）",
    },
    {
        key: "demolition_cost",
        value: "250",
        description: "解体費（万円）",
    },
    {
        key: "default_land_cost",
        value: "1000",
        description: "土地代デフォルト（万円）",
    },
    {
        key: "misc_cost",
        value: "100",
        description: "諸経費（万円）",
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
    const existing = await getAllConfigs();
    const existingKeys = new Set(existing.map((config) => config.key));
    const missingConfigs = DEFAULT_CONFIGS.filter((config) => !existingKeys.has(config.key));

    for (const config of missingConfigs) {
        await upsertConfig(config.key, config.value, config.description);
    }
}

// 型安全な設定値取得
export async function getTypedConfigs() {
    try {
        let configs = await getAllConfigs();

        const missingConfigs = DEFAULT_CONFIGS.filter(
            (config) => !configs.some((existing) => existing.key === config.key)
        );

        if (missingConfigs.length > 0) {
            console.log("Missing configs found, seeding defaults...");
            await seedDefaultConfigs();
            configs = await getAllConfigs();
        }

        const configMap = new Map(configs.map(c => [c.key, c.value]));

        return {
            screeningInterestRate: parseFloat(configMap.get("annual_interest_rate") || "3"),
            repaymentInterestRate: parseFloat(configMap.get("repayment_interest_rate") || "0.8"),
            dtiRatio: parseFloat(configMap.get("dti_ratio") || "35"),
            unitPricePerTsubo: parseFloat(configMap.get("unit_price_per_tsubo") || "82"),
            technostructureUnitPriceIncrease: parseFloat(
                configMap.get("technostructure_unit_price_increase") || "4.8"
            ),
            insulationUnitPriceIncrease: parseFloat(
                configMap.get("insulation_unit_price_increase") || "3"
            ),
            demolitionCost: parseInt(configMap.get("demolition_cost") || "250"),
            defaultLandCost: parseInt(configMap.get("default_land_cost") || "1000"),
            miscCost: parseInt(configMap.get("misc_cost") || "100"),
        };
    } catch (error) {
        console.error("Error getting configs:", error);
        // エラーの場合はデフォルト値を返す
        return {
            screeningInterestRate: 3,
            repaymentInterestRate: 0.8,
            dtiRatio: 35,
            unitPricePerTsubo: 82,
            technostructureUnitPriceIncrease: 4.8,
            insulationUnitPriceIncrease: 3,
            demolitionCost: 250,
            defaultLandCost: 1000,
            miscCost: 100,
        };
    }
}
