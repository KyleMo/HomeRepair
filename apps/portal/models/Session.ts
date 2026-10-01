/**
 * The contract between the portal's session tracking and POST /api/session.
 *
 * Standalone on purpose: the route imports these types, and models/Form.ts
 * pulls in every step component, which has no business in a server bundle.
 */

type IsoDateString = string;

/**
 * One visit to one screen, mapping to a booking_attempt_steps row.
 *
 * `sequence` is the visit's position in this session, counted by the client:
 * it's what makes a resend idempotent, since the row is keyed on
 * (attempt, sequence). A revisit after going back gets its own number.
 */
export type AttemptStepEvent = {
    step_id: string;
    step_label: string;
    /** Set for the per-repair screens (brand, issue, model tag), else null. */
    repair_id: string | null;
    sequence: number;
    entered_at: IsoDateString;
    /** Null while this is the screen the customer is still sitting on. */
    exited_at: IsoDateString | null;
};

export type SessionRecordPayload = {
    /** The embed id from the snippet — resolved server-side to a company. */
    clientId: string;
    /** Client-generated token; the attempt is upserted on it. */
    sessionId: string;
    /** True once the customer reaches the success screen. Never unset. */
    completed: boolean;
    steps: AttemptStepEvent[];
};

/**
 * Caps for the endpoint, which is public and unauthenticated. A normal session
 * sends a couple of steps per request; anything near these limits is either a
 * bug or someone poking at it.
 */
export const MAX_STEPS_PER_REQUEST = 30;
export const MAX_ID_LENGTH = 64;
export const MAX_LABEL_LENGTH = 120;
