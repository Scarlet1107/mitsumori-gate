// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("../lib/generated/prisma");

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
    key: "unit_price_per_tsubo_upto_20",
    value: "105",
    description: "〜20坪 坪単価（万円）",
  },
  {
    key: "unit_price_per_tsubo_upto_25",
    value: "100",
    description: "〜25坪 坪単価（万円）",
  },
  {
    key: "unit_price_per_tsubo_upto_30",
    value: "90",
    description: "〜30坪 坪単価（万円）",
  },
  {
    key: "unit_price_per_tsubo_upto_35",
    value: "87",
    description: "〜35坪 坪単価（万円）",
  },
  {
    key: "unit_price_per_tsubo_upto_40",
    value: "84",
    description: "〜40坪 坪単価（万円）",
  },
  {
    key: "unit_price_per_tsubo_upto_45",
    value: "81",
    description: "〜45坪 坪単価（万円）",
  },
  {
    key: "unit_price_per_tsubo_upto_50",
    value: "78",
    description: "〜50坪 坪単価（万円）",
  },
  {
    key: "unit_price_per_tsubo_upto_55",
    value: "75",
    description: "〜55坪 坪単価（万円）",
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
];

const prisma = new PrismaClient();

async function main() {
  await Promise.all(
    DEFAULT_CONFIGS.map((config) =>
      prisma.appConfig.upsert({
        where: { key: config.key },
        update: {
          value: config.value,
          description: config.description,
        },
        create: config,
      })
    )
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
