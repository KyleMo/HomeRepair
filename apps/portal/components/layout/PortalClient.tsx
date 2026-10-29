"use client";
import { PortalService, PortalSymptom } from "@/models/Settings";
import ClientProvider from "@/context/ClientProvider";
import FormContextProvider from "@/context/FormContextProvider";
import SessionProvider from "@/context/SessionProvider";
import AttemptTracker from "./AttemptTracker";
import PortalForm from "./PortalForm";

export default function PortalHome(props: {
    clientId: string;
    services: PortalService[];
}) {
    return (
        <ClientProvider {...props}>
            <SessionProvider>
                <FormContextProvider>
                    {/* Renders nothing; watches the cursor and records it. */}
                    <AttemptTracker />
                    <PortalForm />
                </FormContextProvider>
            </SessionProvider>
        </ClientProvider>
    );
}
