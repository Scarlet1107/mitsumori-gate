ALTER TABLE "customers" ADD COLUMN "deleted_at" TIMESTAMP(3);

CREATE INDEX "customers_deleted_at_idx" ON "customers"("deleted_at");
