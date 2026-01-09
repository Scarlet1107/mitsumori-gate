export const CONFIG_METADATA = [
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
        key: "unit_price_per_tsubo",
        defaultValue: "82",
        description: "坪単価（万円）",
        help: "建物本体の基準となる坪単価です。",
        unit: "万円",
        step: "0.1",
    },
    {
        key: "technostructure_unit_price_increase",
        defaultValue: "4.8",
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

const CONFIG_META_MAP = new Map(
    CONFIG_METADATA.map((meta) => [meta.key, meta])
);

export function getConfigMeta(key: typeof CONFIG_METADATA[number]["key"]) {
    return CONFIG_META_MAP.get(key);
}
