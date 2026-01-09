export const CONFIG_ORDER = [
    "annual_interest_rate",
    "repayment_interest_rate",
    "dti_ratio",
    "unit_price_per_tsubo",
    "technostructure_unit_price_increase",
    "insulation_unit_price_increase",
    "demolition_cost",
    "default_land_cost",
    "misc_cost",
] as const;

const CONFIG_ORDER_INDEX = new Map(
    CONFIG_ORDER.map((key, index) => [key, index])
);

export function sortConfigs<T extends { key: typeof CONFIG_ORDER[number] }>(configs: T[]): T[] {
    return [...configs].sort((a, b) => {
        const aIndex = CONFIG_ORDER_INDEX.get(a.key) ?? Number.MAX_SAFE_INTEGER;
        const bIndex = CONFIG_ORDER_INDEX.get(b.key) ?? Number.MAX_SAFE_INTEGER;
        if (aIndex !== bIndex) {
            return aIndex - bIndex;
        }
        return a.key.localeCompare(b.key);
    });
}
