"use client";
import { PortalBrandConfig } from "@/models/BrandSettings";
import ClientProvider from "@/context/ClientProvider";
import FormContextProvider from "@/context/FormContextProvider";
import SessionProvider from "@/context/SessionProvider";
import AttemptTracker from "./AttemptTracker";
import PortalForm from "./PortalForm";

export default function PortalHome({ clientId }: { clientId: string }) {
    return (
        <ClientProvider clientId={clientId}>
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
