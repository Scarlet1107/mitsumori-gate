-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('new', 'reform', 'warehouse');

-- CreateTable
CREATE TABLE "intakes" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "consent" BOOLEAN NOT NULL,
    "customer_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "annual_income" INTEGER,
    "budget_total" INTEGER,
    "project_type" "ProjectType",
    "from" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "form_version" TEXT NOT NULL DEFAULT 'v1',

    CONSTRAINT "intakes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "intakes_status_idx" ON "intakes"("status");

-- CreateIndex
CREATE INDEX "intakes_created_at_idx" ON "intakes"("created_at");
