const { PrismaClient } = require("../lib/generated/prisma");

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
