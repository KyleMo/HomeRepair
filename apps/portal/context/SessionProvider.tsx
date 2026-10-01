"use client";
import {
    LocalSession,
    SessionState,
    localStorageSessionKey,
    type AttemptStepEvent,
    type SessionRecordPayload,
} from "@/models/Session";
import { ReactNode, createContext, useRef } from "react";
import { useClient } from "./hooks";

export const SessionContext = createContext<SessionState | null>(null);

const newSessionId = (): string =>
    crypto.randomUUID?.() ??
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

    // screen progression are sent in groups the closing screen and the now opening screen
    const pendingRef = useRef<AttemptStepEvent[]>([]);
    // step sequence ref (might be in localstorage)
    const sequenceRef = useRef(0);

    const nextSequence = () => {
        const session = getSession();
        const sequence =
            Math.max(sequenceRef.current, session?.lastSequence ?? 0) + 1;

        sequenceRef.current = sequence;
        if (session) setSession({ ...session, lastSequence: sequence });

        return sequence;
    };

    const queueStep = (event: AttemptStepEvent) => {
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

        pendingRef.current = [];

        try {
            const response = await fetch("/api/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                // allows this to run after the page is hidden or left
                keepalive: true,
            });

            if (!response.ok) throw new Error(String(response.status));
        } catch (error) {
            pendingRef.current = [...steps, ...pendingRef.current];
            console.warn(`Failed to record session: ${error}`);
        }
    };

    const touch = () => {
        try {
            if (typeof window === "undefined" || !sessionRef.current?.sessionId)
                return;

            if (
                !!sessionRef.current.expiry &&
                Date.now() > Date.parse(sessionRef.current.expiry)
            )
                createSession();
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
