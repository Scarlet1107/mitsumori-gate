/*
  Warnings:

  - You are about to drop the column `age` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `available_annual_for_this_loan` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `available_monthly_for_this_loan` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `bonus_annual` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `bonus_enabled` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `bonus_monthly` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `bonus_per_payment` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `budget_for_building` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `config_annual_interest_rate` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `config_dti_ratio` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `config_max_term_years_cap` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `config_unit_price_per_tsubo` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `has_land` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `head_money` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `household_annual_income` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `income_husband` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `income_wife` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `max_annual_debt` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `max_loan` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `max_term_by_age` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `monthly_rate` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `other_loan_annual_repay` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `postal_code` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `ratio` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `square_meters` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `term_months` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `term_years_effective` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `term_years_selected` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `tsubo` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `wish_loan` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `wish_monthly` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the column `wish_monthly_total` on the `simulations` table. All the data in the column will be lost.
  - You are about to drop the `intakes` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `customer_id` to the `simulations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "simulations" DROP COLUMN "age",
DROP COLUMN "available_annual_for_this_loan",
DROP COLUMN "available_monthly_for_this_loan",
DROP COLUMN "bonus_annual",
DROP COLUMN "bonus_enabled",
DROP COLUMN "bonus_monthly",
DROP COLUMN "bonus_per_payment",
DROP COLUMN "budget_for_building",
DROP COLUMN "config_annual_interest_rate",
DROP COLUMN "config_dti_ratio",
DROP COLUMN "config_max_term_years_cap",
DROP COLUMN "config_unit_price_per_tsubo",
DROP COLUMN "has_land",
DROP COLUMN "head_money",
DROP COLUMN "household_annual_income",
DROP COLUMN "income_husband",
DROP COLUMN "income_wife",
DROP COLUMN "max_annual_debt",
DROP COLUMN "max_loan",
DROP COLUMN "max_term_by_age",
DROP COLUMN "monthly_rate",
DROP COLUMN "other_loan_annual_repay",
DROP COLUMN "postal_code",
DROP COLUMN "ratio",
DROP COLUMN "square_meters",
DROP COLUMN "term_months",
DROP COLUMN "term_years_effective",
DROP COLUMN "term_years_selected",
DROP COLUMN "tsubo",
DROP COLUMN "wish_loan",
DROP COLUMN "wish_monthly",
DROP COLUMN "wish_monthly_total",
ADD COLUMN     "building_budget" DOUBLE PRECISION,
ADD COLUMN     "customer_id" UUID NOT NULL,
ADD COLUMN     "dti_ratio" DOUBLE PRECISION,
ADD COLUMN     "estimated_square_meters" DOUBLE PRECISION,
ADD COLUMN     "estimated_tsubo" DOUBLE PRECISION,
ADD COLUMN     "interest_rate" DOUBLE PRECISION,
ADD COLUMN     "max_loan_amount" DOUBLE PRECISION,
ADD COLUMN     "total_budget" DOUBLE PRECISION,
ADD COLUMN     "unit_price_per_tsubo" INTEGER,
ADD COLUMN     "wish_loan_amount" DOUBLE PRECISION;

-- DropTable
DROP TABLE "public"."intakes";

-- DropEnum
DROP TYPE "public"."ProjectType";

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "postal_code" TEXT,
    "address" TEXT,
    "age" INTEGER,
    "has_spouse" BOOLEAN,
    "own_income" INTEGER,
    "spouse_income" INTEGER,
    "own_loan_payment" INTEGER,
    "spouse_loan_payment" INTEGER,
    "down_payment" INTEGER,
    "wish_monthly_payment" INTEGER,
    "wish_payment_years" INTEGER,
    "uses_bonus" BOOLEAN,
    "has_land" BOOLEAN,
    "uses_technostructure" BOOLEAN,
    "input_mode" TEXT NOT NULL DEFAULT 'web',
    "web_completed" BOOLEAN NOT NULL DEFAULT false,
    "in_person_completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_configs" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "app_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customers_name_idx" ON "customers"("name");

-- CreateIndex
CREATE INDEX "customers_created_at_idx" ON "customers"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "app_configs_key_key" ON "app_configs"("key");

-- CreateIndex
CREATE INDEX "simulations_customer_id_idx" ON "simulations"("customer_id");

-- AddForeignKey
ALTER TABLE "simulations" ADD CONSTRAINT "simulations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
