-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('Trial', 'Active', 'Paused', 'Churned');

-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('Owner', 'Admin', 'Staff');

-- CreateEnum
CREATE TYPE "Font" AS ENUM ('Poppins');

-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('Scheduled', 'InProgress', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "BrandRuleType" AS ENUM ('Allow', 'Deny', 'Prefer');

-- CreateEnum
CREATE TYPE "SymptomRuleType" AS ENUM ('Enabled', 'Disabled');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Los_Angeles',
    "phone" TEXT,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "TenantStatus" NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Los_Angeles',
    "phone" TEXT,
    "address_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "deactivated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "role" "MembershipRole" NOT NULL,
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "company_id" TEXT,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_services" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "job_duration_minutes" INTEGER NOT NULL,
    "appliance_type_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "company_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_brand_settings" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "primary_color" TEXT NOT NULL DEFAULT '#0F6E56',
    "secondary_color" TEXT NOT NULL DEFAULT '#E1F5EE',
    "selected_fill" TEXT NOT NULL DEFAULT '#E1F5EE',
    "selected_text" TEXT NOT NULL DEFAULT '#085041',
    "body_text" TEXT NOT NULL DEFAULT '#000000',
    "button_text" TEXT NOT NULL DEFAULT '#FFFFFF',
    "page_background" TEXT NOT NULL DEFAULT '#F5F7F6',
    "corner_radius" INTEGER NOT NULL DEFAULT 12,
    "font" "Font" NOT NULL DEFAULT 'Poppins',
    "logo_url" TEXT,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "company_brand_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_booking_settings" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "default_window_length_minutes" INTEGER NOT NULL,
    "allowed_jobs_per_window" INTEGER NOT NULL,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "company_booking_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "day_of_week_settings" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_open" BOOLEAN NOT NULL,
    "week_day" "Weekday" NOT NULL,
    "open_at" VARCHAR(5) NOT NULL DEFAULT '09:00',
    "close_at" VARCHAR(5) NOT NULL DEFAULT '17:00',
    "company_booking_setting_id" TEXT NOT NULL,

    CONSTRAINT "day_of_week_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_bookings" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'Scheduled',
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "booked_timezone" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" VARCHAR(3) NOT NULL,
    "postal_code" VARCHAR(10) NOT NULL,
    "country" VARCHAR(2) NOT NULL DEFAULT 'US',
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "company_service_id" TEXT NOT NULL,
    "appliance_brand_id" TEXT,
    "company_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,

    CONSTRAINT "company_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_symptoms" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_booking_id" TEXT NOT NULL,
    "symptom_id" TEXT NOT NULL,

    CONSTRAINT "booking_symptoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_service_duration_overrides" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "company_service_id" TEXT NOT NULL,
    "brand_id" TEXT,
    "symptom_id" TEXT,

    CONSTRAINT "company_service_duration_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_brand_rules" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "rule" "BrandRuleType" NOT NULL,
    "company_id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "appliance_type_id" TEXT,

    CONSTRAINT "company_brand_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appliance_types" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "company_id" TEXT,

    CONSTRAINT "appliance_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "symptoms" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "company_id" TEXT,
    "appliance_type_id" TEXT NOT NULL,
    "brand_id" TEXT,

    CONSTRAINT "symptoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "symptom_rules" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "rule" "SymptomRuleType" NOT NULL,
    "company_id" TEXT NOT NULL,
    "symptom_id" TEXT NOT NULL,

    CONSTRAINT "symptom_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model_tag_locations" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "appliance_type_id" TEXT NOT NULL,
    "brand_id" TEXT,

    CONSTRAINT "model_tag_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[],
    "company_id" TEXT,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_addresses" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "label" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" VARCHAR(3) NOT NULL,
    "postal_code" VARCHAR(10) NOT NULL,
    "country" VARCHAR(2) NOT NULL DEFAULT 'US',
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "customer_id" TEXT NOT NULL,

    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_addresses" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" VARCHAR(3) NOT NULL,
    "postal_code" VARCHAR(10) NOT NULL,
    "country" VARCHAR(2) NOT NULL DEFAULT 'US',
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),

    CONSTRAINT "company_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- CreateIndex
CREATE INDEX "companies_organization_id_idx" ON "companies"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_address_id_key" ON "companies"("address_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "memberships_organization_id_idx" ON "memberships"("organization_id");

-- CreateIndex
CREATE INDEX "memberships_company_id_idx" ON "memberships"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_user_id_company_id_key" ON "memberships"("user_id", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_services_company_id_appliance_type_id_key" ON "company_services"("company_id", "appliance_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_brand_settings_company_id_key" ON "company_brand_settings"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_booking_settings_company_id_key" ON "company_booking_settings"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "day_of_week_settings_company_booking_setting_id_week_day_key" ON "day_of_week_settings"("company_booking_setting_id", "week_day");

-- CreateIndex
CREATE INDEX "company_bookings_company_id_start_time_idx" ON "company_bookings"("company_id", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "booking_symptoms_company_booking_id_symptom_id_key" ON "booking_symptoms"("company_booking_id", "symptom_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_company_id_phone_key" ON "customers"("company_id", "phone");

-- CreateIndex
CREATE INDEX "company_service_duration_overrides_company_service_id_idx" ON "company_service_duration_overrides"("company_service_id");

-- CreateIndex
CREATE INDEX "company_brand_rules_company_id_idx" ON "company_brand_rules"("company_id");

-- CreateIndex
CREATE INDEX "appliance_types_company_id_idx" ON "appliance_types"("company_id");

-- CreateIndex
CREATE INDEX "symptoms_company_id_idx" ON "symptoms"("company_id");

-- CreateIndex
CREATE INDEX "symptoms_appliance_type_id_idx" ON "symptoms"("appliance_type_id");

-- CreateIndex
CREATE INDEX "symptom_rules_company_id_symptom_id_idx" ON "symptom_rules"("company_id", "symptom_id");

-- CreateIndex
CREATE INDEX "model_tag_locations_appliance_type_id_brand_id_idx" ON "model_tag_locations"("appliance_type_id", "brand_id");

-- CreateIndex
CREATE INDEX "brands_company_id_idx" ON "brands"("company_id");

-- CreateIndex
CREATE INDEX "customer_addresses_customer_id_idx" ON "customer_addresses"("customer_id");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "company_addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_services" ADD CONSTRAINT "company_services_appliance_type_id_fkey" FOREIGN KEY ("appliance_type_id") REFERENCES "appliance_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_services" ADD CONSTRAINT "company_services_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_brand_settings" ADD CONSTRAINT "company_brand_settings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_booking_settings" ADD CONSTRAINT "company_booking_settings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "day_of_week_settings" ADD CONSTRAINT "day_of_week_settings_company_booking_setting_id_fkey" FOREIGN KEY ("company_booking_setting_id") REFERENCES "company_booking_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_bookings" ADD CONSTRAINT "company_bookings_company_service_id_fkey" FOREIGN KEY ("company_service_id") REFERENCES "company_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_bookings" ADD CONSTRAINT "company_bookings_appliance_brand_id_fkey" FOREIGN KEY ("appliance_brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_bookings" ADD CONSTRAINT "company_bookings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_bookings" ADD CONSTRAINT "company_bookings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_symptoms" ADD CONSTRAINT "booking_symptoms_company_booking_id_fkey" FOREIGN KEY ("company_booking_id") REFERENCES "company_bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_symptoms" ADD CONSTRAINT "booking_symptoms_symptom_id_fkey" FOREIGN KEY ("symptom_id") REFERENCES "symptoms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_service_duration_overrides" ADD CONSTRAINT "company_service_duration_overrides_company_service_id_fkey" FOREIGN KEY ("company_service_id") REFERENCES "company_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_service_duration_overrides" ADD CONSTRAINT "company_service_duration_overrides_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_service_duration_overrides" ADD CONSTRAINT "company_service_duration_overrides_symptom_id_fkey" FOREIGN KEY ("symptom_id") REFERENCES "symptoms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_brand_rules" ADD CONSTRAINT "company_brand_rules_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_brand_rules" ADD CONSTRAINT "company_brand_rules_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_brand_rules" ADD CONSTRAINT "company_brand_rules_appliance_type_id_fkey" FOREIGN KEY ("appliance_type_id") REFERENCES "appliance_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appliance_types" ADD CONSTRAINT "appliance_types_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_appliance_type_id_fkey" FOREIGN KEY ("appliance_type_id") REFERENCES "appliance_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "symptom_rules" ADD CONSTRAINT "symptom_rules_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "symptom_rules" ADD CONSTRAINT "symptom_rules_symptom_id_fkey" FOREIGN KEY ("symptom_id") REFERENCES "symptoms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_tag_locations" ADD CONSTRAINT "model_tag_locations_appliance_type_id_fkey" FOREIGN KEY ("appliance_type_id") REFERENCES "appliance_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_tag_locations" ADD CONSTRAINT "model_tag_locations_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brands" ADD CONSTRAINT "brands_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
