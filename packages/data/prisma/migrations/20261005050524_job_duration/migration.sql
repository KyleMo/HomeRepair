/*
  Warnings:

  - You are about to drop the column `job_duration_minutes` on the `company_services` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[company_id,symptom_id]` on the table `symptom_rules` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "appliance_types" ADD COLUMN     "default_job_duration_minutes" INTEGER NOT NULL DEFAULT 60;

-- AlterTable
ALTER TABLE "company_services" DROP COLUMN "job_duration_minutes";

-- CreateIndex
CREATE UNIQUE INDEX "symptom_rules_company_id_symptom_id_key" ON "symptom_rules"("company_id", "symptom_id");
