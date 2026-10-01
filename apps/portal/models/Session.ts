type IsoDateString = string;

export type AttemptStepEvent = {
    step_id: string;
    step_label: string;
    repair_id: string | null;
    sequence: number;
    entered_at: IsoDateString;
    // null when the user is currently on the screen
    exited_at: IsoDateString | null;
};

export type SessionRecordPayload = {
    clientId: string;
    // Client-generated token; the attempt is upserted on it.
    sessionId: string;
    completed: boolean;
    steps: AttemptStepEvent[];
};

type LocalStorageSessionKey = "ds_session_id";
export const localStorageSessionKey: LocalStorageSessionKey = "ds_session_id";
export type LocalSession = {
    clientId: string;
    sessionId: string;
    lastActivity: IsoDateString;
    expiry: IsoDateString;
    /**
     * Highest screen-visit number recorded for this session.
     *
     * Stored rather than counted in memory because the step rows are keyed on
     * (attempt, sequence): a reload mid-session would otherwise restart at 1
     * and the upsert would overwrite the session's first visits instead of
     * appending to them.
     */
    lastSequence: number;
};

export type SessionState = {
    getSession: () => LocalSession | null;
    setSession: (
        session: Partial<LocalSession> & { sessionId: string },
    ) => void;
    touch: () => void;
    nextSequence: () => number;
    queueStep: (event: AttemptStepEvent) => void;
    record: (options?: { completed?: boolean }) => Promise<void>;
    init: () => void;
};

export const MAX_STEPS_PER_REQUEST = 30;
export const MAX_ID_LENGTH = 64;
export const MAX_LABEL_LENGTH = 120;
