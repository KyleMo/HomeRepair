-- CreateTable
CREATE TABLE "company_booking_attempts" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "session_token" TEXT NOT NULL,
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "company_id" TEXT NOT NULL,
    "company_booking_id" TEXT,

    CONSTRAINT "company_booking_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_attempt_steps" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "step_id" TEXT NOT NULL,
    "step_label" TEXT NOT NULL,
    "repair_id" TEXT,
    "sequence" INTEGER NOT NULL,
    "entered_at" TIMESTAMP(3) NOT NULL,
    "exited_at" TIMESTAMP(3),
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "company_booking_attempt_id" TEXT NOT NULL,

    CONSTRAINT "booking_attempt_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_booking_attempts_session_token_key" ON "company_booking_attempts"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "company_booking_attempts_company_booking_id_key" ON "company_booking_attempts"("company_booking_id");

-- CreateIndex
CREATE INDEX "company_booking_attempts_company_id_created_at_idx" ON "company_booking_attempts"("company_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "booking_attempt_steps_company_booking_attempt_id_sequence_key" ON "booking_attempt_steps"("company_booking_attempt_id", "sequence");

-- AddForeignKey
ALTER TABLE "company_booking_attempts" ADD CONSTRAINT "company_booking_attempts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_booking_attempts" ADD CONSTRAINT "company_booking_attempts_company_booking_id_fkey" FOREIGN KEY ("company_booking_id") REFERENCES "company_bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_attempt_steps" ADD CONSTRAINT "booking_attempt_steps_company_booking_attempt_id_fkey" FOREIGN KEY ("company_booking_attempt_id") REFERENCES "company_booking_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
