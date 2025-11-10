-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "postal_code" TEXT,
    "base_address" TEXT,
    "detail_address" TEXT,
    "age" INTEGER,
    "has_spouse" BOOLEAN,
    "spouse_name" TEXT,
    "own_income" INTEGER,
    "spouse_income" INTEGER,
    "own_loan_payment" INTEGER,
    "spouse_loan_payment" INTEGER,
    "down_payment" INTEGER,
    "wish_monthly_payment" INTEGER,
    "wish_payment_years" INTEGER,
    "uses_bonus" BOOLEAN,
    "bonus_payment" INTEGER,
    "has_land" BOOLEAN,
    "uses_technostructure" BOOLEAN,
    "input_mode" TEXT NOT NULL DEFAULT 'web',
    "web_completed" BOOLEAN NOT NULL DEFAULT false,
    "in_person_completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulations" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "customer_id" UUID NOT NULL,
    "max_loan_amount" DOUBLE PRECISION,
    "wish_loan_amount" DOUBLE PRECISION,
    "total_budget" DOUBLE PRECISION,
    "building_budget" DOUBLE PRECISION,
    "estimated_tsubo" DOUBLE PRECISION,
    "estimated_square_meters" DOUBLE PRECISION,
    "interest_rate" DOUBLE PRECISION,
    "dti_ratio" DOUBLE PRECISION,
    "unit_price_per_tsubo" INTEGER,

    CONSTRAINT "simulations_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "simulations_customer_id_idx" ON "simulations"("customer_id");

-- CreateIndex
CREATE INDEX "simulations_created_at_idx" ON "simulations"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "app_configs_key_key" ON "app_configs"("key");

-- AddForeignKey
ALTER TABLE "simulations" ADD CONSTRAINT "simulations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
