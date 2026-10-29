"use client";
import { PortalService, PortalSymptom } from "@/models/Settings";
import { ReactNode, createContext } from "react";

export const ClientContext = createContext<{
    clientId: string;
    symptoms: PortalSymptom[];
    services: PortalService[];
} | null>(null);

const ClientProvider = (props: {
    clientId: string;
    services: PortalService[];
    children: ReactNode;
}) => {
    const symptoms = props.services.flatMap(
        (cs) => cs.appliance_type.symptoms,
    ) as PortalSymptom[];

    return (
        <ClientContext.Provider
            value={{
                clientId: props.clientId,
                services: props.services,
                symptoms,
            }}
        >
            {props.children}
        </ClientContext.Provider>
    );
};

export default ClientProvider;
