/*
  Warnings:

  - You are about to drop the column `appliance_brand_id` on the `company_bookings` table. All the data in the column will be lost.
  - You are about to drop the column `company_service_id` on the `company_bookings` table. All the data in the column will be lost.
  - You are about to drop the `booking_symptoms` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "booking_symptoms" DROP CONSTRAINT "booking_symptoms_company_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "booking_symptoms" DROP CONSTRAINT "booking_symptoms_symptom_id_fkey";

-- DropForeignKey
ALTER TABLE "company_bookings" DROP CONSTRAINT "company_bookings_appliance_brand_id_fkey";

-- DropForeignKey
ALTER TABLE "company_bookings" DROP CONSTRAINT "company_bookings_company_service_id_fkey";

-- AlterTable
ALTER TABLE "company_bookings" DROP COLUMN "appliance_brand_id",
DROP COLUMN "company_service_id";

-- DropTable
DROP TABLE "booking_symptoms";

-- CreateTable
CREATE TABLE "booking_repairs" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_booking_id" TEXT NOT NULL,
    "company_service_id" TEXT NOT NULL,
    "appliance_brand_id" TEXT,
    "duration_minutes" INTEGER NOT NULL,

    CONSTRAINT "booking_repairs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repair_symptoms" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "booking_repair_id" TEXT NOT NULL,
    "symptom_id" TEXT NOT NULL,

    CONSTRAINT "repair_symptoms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_repairs_company_booking_id_idx" ON "booking_repairs"("company_booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "repair_symptoms_booking_repair_id_symptom_id_key" ON "repair_symptoms"("booking_repair_id", "symptom_id");

-- AddForeignKey
ALTER TABLE "booking_repairs" ADD CONSTRAINT "booking_repairs_company_booking_id_fkey" FOREIGN KEY ("company_booking_id") REFERENCES "company_bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_repairs" ADD CONSTRAINT "booking_repairs_company_service_id_fkey" FOREIGN KEY ("company_service_id") REFERENCES "company_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_repairs" ADD CONSTRAINT "booking_repairs_appliance_brand_id_fkey" FOREIGN KEY ("appliance_brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_symptoms" ADD CONSTRAINT "repair_symptoms_booking_repair_id_fkey" FOREIGN KEY ("booking_repair_id") REFERENCES "booking_repairs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_symptoms" ADD CONSTRAINT "repair_symptoms_symptom_id_fkey" FOREIGN KEY ("symptom_id") REFERENCES "symptoms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
