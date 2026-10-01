import {
    MAX_ID_LENGTH,
    MAX_LABEL_LENGTH,
    MAX_STEPS_PER_REQUEST,
    type AttemptStepEvent,
    type SessionRecordPayload,
} from "@/models/Session";
import { prisma } from "@homerepair/data";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
    try {
        const payload = parsePayload(await request.json());

        if (!payload)
            return NextResponse.json(
                { error: "Invalid session payload" },
                { status: 400 },
            );

        const now = new Date();

        const attempt = await prisma.companyBookingAttempt
            .upsert({
                where: { session_token: payload.sessionId },
                create: {
                    session_token: payload.sessionId,
                    company: { connect: { id: payload.clientId } },
                    last_activity_at: now,
                    completed_at: payload.completed ? now : null,
                },
                update: { last_activity_at: now },
                select: { id: true },
            })
            .catch((error: unknown) => {
                if (isRecordNotFound(error)) return null;
                throw error;
            });

        if (!attempt)
            return NextResponse.json({ error: "Not found" }, { status: 404 });

        if (payload.completed)
            await prisma.companyBookingAttempt.updateMany({
                where: {
                    session_token: payload.sessionId,
                    completed_at: null,
                },
                data: { completed_at: now },
            });

        // Array form rather than an interactive transaction: the operations go
        // in one batch instead of a round trip per step, so the row locks are
        // held for a fraction of the time. These requests arrive in bursts from
        // pagehide beacons, and two flushes for the same attempt do contend.
        //
        // `payload.steps` is sorted by sequence, so concurrent requests take the
        // row locks in the same order and can't deadlock each other.
        await prisma.$transaction(
            payload.steps.map((step) =>
                prisma.bookingAttemptStep.upsert({
                    where: {
                        company_booking_attempt_id_sequence: {
                            company_booking_attempt_id: attempt.id,
                            sequence: step.sequence,
                        },
                    },
                    create: {
                        company_booking_attempt_id: attempt.id,
                        step_id: step.step_id,
                        step_label: step.step_label,
                        repair_id: step.repair_id,
                        sequence: step.sequence,
                        entered_at: new Date(step.entered_at),
                        exited_at: step.exited_at
                            ? new Date(step.exited_at)
                            : null,
                    },
                    // The same visit is sent twice — once open, once closed —
                    // so only the exit time can change.
                    update: {
                        exited_at: step.exited_at
                            ? new Date(step.exited_at)
                            : null,
                    },
                }),
            ),
        );

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[POST session]", error);
        return NextResponse.json(
            { error: "Failed to record session" },
            { status: 500 },
        );
    }
};

/**
 * Prisma's "required record not found" code, raised here when `connect` names a
 * company that doesn't exist.
 *
 * Read off the error rather than via `instanceof
 * Prisma.PrismaClientKnownRequestError`, because @homerepair/data re-exports the
 * Prisma namespace as types only — the runtime class isn't available to compare
 * against.
 */
const isRecordNotFound = (error: unknown): boolean =>
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === "P2025";

const isIsoDate = (value: unknown): value is string =>
    typeof value === "string" && !Number.isNaN(Date.parse(value));

const isId = (value: unknown): value is string =>
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_ID_LENGTH;

const parseStep = (value: unknown): AttemptStepEvent | null => {
    if (typeof value !== "object" || value === null) return null;

    const step = value as Record<string, unknown>;

    if (!isId(step.step_id)) return null;
    if (
        typeof step.step_label !== "string" ||
        step.step_label.length > MAX_LABEL_LENGTH
    )
        return null;
    if (step.repair_id !== null && !isId(step.repair_id)) return null;
    if (
        typeof step.sequence !== "number" ||
        !Number.isInteger(step.sequence) ||
        step.sequence < 1
    )
        return null;
    if (!isIsoDate(step.entered_at)) return null;
    if (step.exited_at !== null && !isIsoDate(step.exited_at)) return null;

    return {
        step_id: step.step_id,
        step_label: step.step_label,
        repair_id: step.repair_id as string | null,
        sequence: step.sequence,
        entered_at: step.entered_at,
        exited_at: step.exited_at as string | null,
    };
};

/**
 * Validated by hand rather than with a schema library: the portal has no
 * validation dependency, and this is the only endpoint that takes a body.
 */
const parsePayload = (value: unknown): SessionRecordPayload | null => {
    if (typeof value !== "object" || value === null) return null;

    const payload = value as Record<string, unknown>;

    if (!isId(payload.clientId)) return null;
    if (!isId(payload.sessionId)) return null;
    if (typeof payload.completed !== "boolean") return null;
    if (!Array.isArray(payload.steps)) return null;
    if (
        payload.steps.length === 0 ||
        payload.steps.length > MAX_STEPS_PER_REQUEST
    )
        return null;

    const steps: AttemptStepEvent[] = [];
    for (const raw of payload.steps) {
        const step = parseStep(raw);
        if (!step) return null;
        steps.push(step);
    }

    // Two events for one sequence in a single request would make the upsert
    // order decide the outcome.
    if (new Set(steps.map((s) => s.sequence)).size !== steps.length)
        return null;

    return {
        clientId: payload.clientId,
        sessionId: payload.sessionId,
        completed: payload.completed,
        // Sorted here so every request writes these rows in the same order —
        // two concurrent flushes for one attempt then queue behind each other
        // instead of deadlocking on rows they each half-hold.
        steps: steps.sort((a, b) => a.sequence - b.sequence),
    };
};
