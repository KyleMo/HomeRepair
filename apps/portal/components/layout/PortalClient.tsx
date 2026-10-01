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
                        <InnerForm />
                    </FormContextProvider>
                </SessionProvider>
            </ClientProvider>
        </PortalBase>
    );
}

const InnerForm = () => {
    const { form } = useFormContext();
    const step = allSteps[form.cursor.stepId];

    if (!step) {
        return <h2>Failed to find current step</h2>;
    }
    return (
        <>
            <Header progress={form.progress} />
            <step.Component />
            {step.hasFooter && <Footer />}
            <div
                style={{
                    position: "fixed",
                    fontSize: 10,
                    marginLeft: 10,
                    bottom: 5,
                    left: 5,
                }}
            >
                Powered by HomeRepair
            </div>
        </>
    );
};
