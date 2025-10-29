-- CreateTable
CREATE TABLE "simulations" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "age" INTEGER NOT NULL,
    "postal_code" TEXT NOT NULL,
    "income_husband" INTEGER NOT NULL,
    "income_wife" INTEGER NOT NULL,
    "other_loan_annual_repay" INTEGER NOT NULL,
    "head_money" INTEGER NOT NULL,
    "has_land" BOOLEAN NOT NULL,
    "wish_monthly" INTEGER NOT NULL,
    "term_years_selected" INTEGER NOT NULL,
    "term_years_effective" INTEGER NOT NULL,
    "bonus_enabled" BOOLEAN NOT NULL,
    "bonus_per_payment" INTEGER NOT NULL,
    "bonus_annual" INTEGER NOT NULL,
    "bonus_monthly" DOUBLE PRECISION NOT NULL,
    "wish_monthly_total" DOUBLE PRECISION NOT NULL,
    "household_annual_income" INTEGER NOT NULL,
    "max_annual_debt" DOUBLE PRECISION NOT NULL,
    "available_annual_for_this_loan" DOUBLE PRECISION NOT NULL,
    "available_monthly_for_this_loan" DOUBLE PRECISION NOT NULL,
    "max_loan" DOUBLE PRECISION NOT NULL,
    "wish_loan" DOUBLE PRECISION NOT NULL,
    "ratio" DOUBLE PRECISION NOT NULL,
    "budget_for_building" DOUBLE PRECISION NOT NULL,
    "tsubo" DOUBLE PRECISION NOT NULL,
    "square_meters" DOUBLE PRECISION NOT NULL,
    "term_months" INTEGER NOT NULL,
    "monthly_rate" DOUBLE PRECISION NOT NULL,
    "max_term_by_age" INTEGER NOT NULL,
    "config_annual_interest_rate" DOUBLE PRECISION NOT NULL,
    "config_max_term_years_cap" INTEGER NOT NULL,
    "config_dti_ratio" DOUBLE PRECISION NOT NULL,
    "config_unit_price_per_tsubo" INTEGER NOT NULL,

    CONSTRAINT "simulations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "simulations_created_at_idx" ON "simulations"("created_at");
