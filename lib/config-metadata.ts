const BASE_CONFIG_METADATA = [
    {
        key: "annual_interest_rate",
        defaultValue: "3",
        description: "審査金利（%）",
        help: "借入可能額の上限計算に使う審査用の金利です。",
        unit: "%",
        step: "0.1",
    },
    {
        key: "repayment_interest_rate",
        defaultValue: "0.8",
        description: "返済金利（%）",
        help: "返済額や総返済額の算出に使う金利です。",
        unit: "%",
        step: "0.1",
    },
    {
        key: "dti_ratio",
        defaultValue: "35",
        description: "DTI比率（%）",
        help: "年収に対する年間返済額の上限割合です。例えば年収1,000万円でDTI比率35%の場合、年間返済額の上限は350万円となります。",
        unit: "%",
        step: "0.1",
    },
    {
        key: "technostructure_unit_price_increase",
        defaultValue: "4.5",
        description: "テクノストラクチャー坪単価増加分（万円）",
        help: "テクノストラクチャー採用時の坪単価の上乗せ額です。",
        unit: "万円",
        step: "0.1",
    },
    {
        key: "insulation_unit_price_increase",
        defaultValue: "3",
        description: "付加断熱坪単価増加分（万円）",
        help: "付加断熱を採用した場合の坪単価の上乗せ額です。",
        unit: "万円",
        step: "0.1",
    },
    {
        key: "demolition_cost",
        defaultValue: "250",
        description: "解体費（万円）",
        help: "既存建物がある場合の解体費用です。「土地あり」「既存建物あり」の場合に加算されます。",
        unit: "万円",
        step: "1",
    },
    {
        key: "default_land_cost",
        defaultValue: "1000",
        description: "土地代デフォルト（万円）",
        help: "「土地なし」「土地の予算が決まっていない」場合に使う土地代の既定値です。",
        unit: "万円",
        step: "1",
    },
    {
        key: "misc_cost",
        defaultValue: "100",
        description: "諸経費（万円）",
        help: "建築にかかる諸経費の一律加算額です。",
        unit: "万円",
        step: "1",
    },
] as const;

export const UNIT_PRICE_TIER_METADATA = [
    {
        key: "unit_price_per_tsubo_upto_20",
        maxTsubo: 20,
        defaultValue: "105",
        description: "〜20坪 坪単価（万円）",
        help: "施工面積20坪以下の場合に適用する坪単価です。",
        unit: "万円",
        step: "0.1",
    },
    {
        key: "unit_price_per_tsubo_upto_25",
        maxTsubo: 25,
        defaultValue: "100",
        description: "〜25坪 坪単価（万円）",
        help: "施工面積25坪以下の場合に適用する坪単価です。",
        unit: "万円",
        step: "0.1",
    },
    {
        key: "unit_price_per_tsubo_upto_30",
        maxTsubo: 30,
        defaultValue: "90",
        description: "〜30坪 坪単価（万円）",
        help: "施工面積30坪以下の場合に適用する坪単価です。",
        unit: "万円",
        step: "0.1",
    },
    {
        key: "unit_price_per_tsubo_upto_35",
        maxTsubo: 35,
        defaultValue: "87",
        description: "〜35坪 坪単価（万円）",
        help: "施工面積35坪以下の場合に適用する坪単価です。",
        unit: "万円",
        step: "0.1",
    },
    {
        key: "unit_price_per_tsubo_upto_40",
        maxTsubo: 40,
        defaultValue: "84",
        description: "〜40坪 坪単価（万円）",
        help: "施工面積40坪以下の場合に適用する坪単価です。",
        unit: "万円",
        step: "0.1",
    },
    {
        key: "unit_price_per_tsubo_upto_45",
        maxTsubo: 45,
        defaultValue: "81",
        description: "〜45坪 坪単価（万円）",
        help: "施工面積45坪以下の場合に適用する坪単価です。",
        unit: "万円",
        step: "0.1",
    },
    {
        key: "unit_price_per_tsubo_upto_50",
        maxTsubo: 50,
        defaultValue: "78",
        description: "〜50坪 坪単価（万円）",
        help: "施工面積50坪以下の場合に適用する坪単価です。",
        unit: "万円",
        step: "0.1",
    },
    {
        key: "unit_price_per_tsubo_upto_55",
        maxTsubo: 55,
        defaultValue: "75",
        description: "〜55坪 坪単価（万円）",
        help: "施工面積55坪以下の場合に適用する坪単価です。",
        unit: "万円",
        step: "0.1",
    },
] as const;

export const CONFIG_METADATA = [
    ...BASE_CONFIG_METADATA,
    ...UNIT_PRICE_TIER_METADATA,
] as const;

export type ConfigKey = typeof CONFIG_METADATA[number]["key"];
export type UnitPriceTierKey = typeof UNIT_PRICE_TIER_METADATA[number]["key"];

const CONFIG_META_MAP = new Map(
    CONFIG_METADATA.map((meta) => [meta.key, meta])
);

export function getConfigMeta(key: ConfigKey) {
    return CONFIG_META_MAP.get(key);
}

export function isUnitPriceTierKey(key: string): key is UnitPriceTierKey {
    return UNIT_PRICE_TIER_METADATA.some((meta) => meta.key === key);
}
