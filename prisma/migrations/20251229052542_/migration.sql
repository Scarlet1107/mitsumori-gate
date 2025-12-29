-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "has_existing_building" BOOLEAN,
ADD COLUMN     "has_land_budget" BOOLEAN,
ADD COLUMN     "land_budget" INTEGER,
ADD COLUMN     "spouse_age" INTEGER;
