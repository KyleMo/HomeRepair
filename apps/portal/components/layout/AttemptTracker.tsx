"use client";
import { useFormContext, usePortalSession } from "@/context/hooks";
import { StepCursor, allSteps } from "@/models/Form";
import { useEffect, useRef } from "react";
const SUCCESS_STEP_ID = "hr_success_step";

const AttemptTracker = () => {
    const { form } = useFormContext();
    const { init, nextSequence, queueStep, record } = usePortalSession();

    /** The open visit — queued with no exited_at until the cursor moves on. */
    const openVisit = useRef<{
        cursor: StepCursor;
        enteredAt: string;
        sequence: number;
    } | null>(null);

    useEffect(() => {
        if (form.repairs.length === 0) return;
        init();
        record();
    }, [form.repairs.length]);

    useEffect(() => {
        const cursor = form.cursor;
        const open = openVisit.current;

        // Strict Mode invokes effects twice in development; without this the
        // same screen would be recorded as two visits.
        if (
            open &&
            open.cursor.stepId === cursor.stepId &&
            open.cursor.repairId === cursor.repairId
        )
            return;

        const now = new Date().toISOString();

        // Close the screen they just left. Its dwell time is the difference
        // between these two timestamps.
        if (open)
            queueStep({
                step_id: open.cursor.stepId,
                step_label:
                    allSteps[open.cursor.stepId]?.label ?? open.cursor.stepId,
                repair_id: open.cursor.repairId ?? null,
                sequence: open.sequence,
                entered_at: open.enteredAt,
                exited_at: now,
            });

        // Open the new one. It stays without an exited_at, which is what marks
        // the drop-off point if they never come back.
        const sequence = nextSequence();
        queueStep({
            step_id: cursor.stepId,
            step_label: allSteps[cursor.stepId]?.label ?? cursor.stepId,
            repair_id: cursor.repairId ?? null,
            sequence,
            entered_at: now,
            exited_at: null,
        });

        openVisit.current = { cursor, enteredAt: now, sequence };

        // record on every cursor page change
        record({ completed: cursor.stepId === SUCCESS_STEP_ID });
    }, [form.cursor]);

    useEffect(() => {
        const flush = () => {
            void record();
        };

        // `pagehide` covers unload, close and the back/forward cache, where
        // `unload` is unreliable. `visibilitychange` covers backgrounding,
        // which pagehide misses entirely and where a mobile browser is free to
        // kill the tab without further warning.
        const onVisibilityChange = () => {
            if (document.visibilityState === "hidden") flush();
        };

        window.addEventListener("pagehide", flush);
        document.addEventListener("visibilitychange", onVisibilityChange);

        return () => {
            window.removeEventListener("pagehide", flush);
            document.removeEventListener(
                "visibilitychange",
                onVisibilityChange,
            );
        };
    }, []);

    return null;
};

export default AttemptTracker;
