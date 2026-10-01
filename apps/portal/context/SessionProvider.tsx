"use client";
import {
    LocalSession,
    SessionState,
    localStorageSessionKey,
} from "@/models/Form";
import type { AttemptStepEvent, SessionRecordPayload } from "@/models/Session";
import { ReactNode, createContext, useRef } from "react";
import { useClient } from "./hooks";

export const SessionContext = createContext<SessionState | null>(null);

const newSessionId = (): string =>
    crypto.randomUUID?.() ??
    // Safari < 15.4 has getRandomValues but not randomUUID
    Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
        b.toString(16).padStart(2, "0"),
    ).join("");

const SessionProvider = ({ children }: { children: ReactNode }) => {
    const sessionRef = useRef<null | LocalSession>(null);
    const { clientId } = useClient();

    const getSession = () => {
        if (typeof window === "undefined") return null;

        try {
            const localStorageString = window.localStorage.getItem(
                localStorageSessionKey,
            );
            if (!!localStorageString) {
                const session = JSON.parse(localStorageString) as LocalSession;

                if (Date.now() >= Date.parse(session.expiry)) {
                    return null;
                } else {
                    sessionRef.current = session;
                    return sessionRef.current;
                }
            }

            return sessionRef.current;
        } catch (error) {
            console.warn(`Failed to read local storage session: ${error}`);
            return null;
        }
    };

    /**
     * Screen visits waiting to be sent. Buffered rather than sent per event so
     * a burst of navigation is one request, and so visits made before the
     * session exists — the appliance screen, which is what creates it — aren't
     * lost.
     */
    const pendingRef = useRef<AttemptStepEvent[]>([]);

    /**
     * In-memory mirror of the stored counter, so visits recorded before a
     * session exists — the appliance screen, which is what creates it — still
     * get increasing numbers.
     */
    const sequenceRef = useRef(0);

    const nextSequence = () => {
        // getSession adopts a stored session, so a reload picks up where the
        // previous page load left off rather than restarting at 1. An expired
        // session returns null, and starting again at 1 is then correct: the
        // next event belongs to a new attempt with its own token.
        const session = getSession();
        const sequence =
            Math.max(sequenceRef.current, session?.lastSequence ?? 0) + 1;

        sequenceRef.current = sequence;
        if (session) setSession({ ...session, lastSequence: sequence });

        return sequence;
    };

    const queueStep = (event: AttemptStepEvent) => {
        // Re-queueing a sequence replaces it: the same visit is queued twice,
        // once open and once with its exited_at, and only the later one matters.
        pendingRef.current = [
            ...pendingRef.current.filter((e) => e.sequence !== event.sequence),
            event,
        ];
    };

    const record = async (options?: { completed?: boolean }) => {
        const session = sessionRef.current;
        const steps = pendingRef.current;

        if (!session || !clientId || steps.length === 0) return;

        const payload: SessionRecordPayload = {
            clientId,
            sessionId: session.sessionId,
            completed: options?.completed ?? false,
            steps,
        };

        // Cleared up front so visits made while this request is in flight queue
        // behind it rather than being sent twice.
        pendingRef.current = [];

        try {
            const response = await fetch("/api/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                // Lets the request outlive the page when this runs from
                // pagehide — the abandonment case, which is the one that
                // matters most.
                keepalive: true,
            });

            if (!response.ok) throw new Error(String(response.status));
        } catch (error) {
            // Put them back for the next flush. The rows upsert on
            // (attempt, sequence), so resending can't duplicate anything.
            pendingRef.current = [...steps, ...pendingRef.current];
            console.warn(`Failed to record session: ${error}`);
        }
    };

    const touch = () => {
        try {
            if (typeof window === "undefined" || !sessionRef.current?.sessionId)
                return;

            // if the session is expired, create new session and record
            if (
                !!sessionRef.current.expiry &&
                Date.now() > Date.parse(sessionRef.current.expiry)
            )
                createSession();
            // trigger expiry to update
            else
                setSession({
                    sessionId: sessionRef.current.sessionId,
                    lastActivity: new Date().toISOString(),
                });
        } catch (error) {
            console.warn(`Failed to touch local session: ${error}`);
        }
    };

    const createSession = () => {
        setSession({
            sessionId: newSessionId(),
            clientId: clientId as string,
            // Visits already buffered for this page load belong to this new
            // attempt, so the counter carries over rather than resetting.
            lastSequence: sequenceRef.current,
        });
    };

    const init = () => {
        try {
            if (typeof window === "undefined") return;
            if (!sessionRef.current) {
                const localStorageString = window.localStorage.getItem(
                    localStorageSessionKey,
                );
                if (!!localStorageString) {
                    const session = JSON.parse(
                        localStorageString,
                    ) as LocalSession;

                    // if session is still valid
                    if (Date.now() < Date.parse(session.expiry))
                        sessionRef.current = session;
                    else createSession();
                } else createSession();
            }
        } catch (error) {
            console.warn(`Failed to read local storage session: ${error}`);
        }
    };

    const setSession = (
        session: Partial<LocalSession> & { sessionId: string },
    ) => {
        try {
            if (typeof window === "undefined") return;

            if (!!session.sessionId) {
                const now = new Date();
                const expiry = new Date(now.setHours(now.getHours() + 1));
                const newSession: LocalSession = {
                    ...(session as LocalSession),
                    expiry: expiry.toISOString(),
                };
                window.localStorage.setItem(
                    localStorageSessionKey,
                    JSON.stringify(newSession),
                );
                sessionRef.current = newSession;
            } else {
                sessionRef.current = null;
                window.localStorage.removeItem(localStorageSessionKey);
            }
        } catch (error) {
            console.warn(`Failed to set session: ${error}`);
        }
    };

    return (
        <SessionContext.Provider
            value={{
                getSession,
                setSession,
                touch,
                nextSequence,
                queueStep,
                record,
                init,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
};

export default SessionProvider;
