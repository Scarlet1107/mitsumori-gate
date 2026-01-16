import { UNIT_PRICE_TIER_METADATA, type UnitPriceTierKey } from "@/lib/config-metadata";

export const BASE_CONFIG_ORDER = [
    "annual_interest_rate",
    "repayment_interest_rate",
    "dti_ratio",
    "technostructure_unit_price_increase",
    "insulation_unit_price_increase",
    "demolition_cost",
    "default_land_cost",
    "misc_cost",
] as const;

export type BaseConfigKey = typeof BASE_CONFIG_ORDER[number];

const BASE_CONFIG_ORDER_INDEX = new Map(
    BASE_CONFIG_ORDER.map((key, index) => [key, index])
);

export function sortBaseConfigs<T extends { key: BaseConfigKey }>(configs: T[]): T[] {
    return [...configs].sort((a, b) => {
        const aIndex = BASE_CONFIG_ORDER_INDEX.get(a.key) ?? Number.MAX_SAFE_INTEGER;
        const bIndex = BASE_CONFIG_ORDER_INDEX.get(b.key) ?? Number.MAX_SAFE_INTEGER;
        if (aIndex !== bIndex) {
            return aIndex - bIndex;
        }
        return a.key.localeCompare(b.key);
    });
}

export function sortUnitPriceConfigs<T extends { key: UnitPriceTierKey }>(configs: T[]): T[] {
    const indexMap = new Map(
        UNIT_PRICE_TIER_METADATA.map((meta, index) => [meta.key, index])
    );
    return [...configs].sort((a, b) => {
        const aIndex = indexMap.get(a.key) ?? Number.MAX_SAFE_INTEGER;
        const bIndex = indexMap.get(b.key) ?? Number.MAX_SAFE_INTEGER;
        return aIndex - bIndex;
    });
}
