"use client";
import { useFormContext } from "@/context/hooks";
import Footer from "@/components/layout/Footer";
import { allSteps } from "@/models/Form";
import PortalBase from "@/components/layout/PortalBase";
import Header from "./Header";
import { PortalBrandConfig } from "@/models/BrandSettings";
import ClientProvider from "@/context/ClientProvider";
import FormContextProvider from "@/context/FormContextProvider";
import SessionProvider from "@/context/SessionProvider";
import AttemptTracker from "./AttemptTracker";
import PortalForm from "./PortalForm";

export default function PortalHome({
    clientId,
    config,
}: {
    clientId: string;
    config: PortalBrandConfig;
}) {
    return (
        <PortalBase>
            <ClientProvider clientId={clientId} brandSettings={config}>
                <SessionProvider>
                    <FormContextProvider>
                        {/* Renders nothing; watches the cursor and records it. */}
                        <AttemptTracker />
                        <PortalForm />
                    </FormContextProvider>
                </SessionProvider>
            </ClientProvider>
        </PortalBase>
    );
}
