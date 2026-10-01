"use client";
import { PortalBrandConfig } from "@/models/BrandSettings";
import { ReactNode, createContext, useEffect, useMemo, useState } from "react";

export const ClientContext = createContext<{
    clientId: string;
    brandSettings: PortalBrandConfig;
} | null>(null);

const ClientProvider = (props: {
    clientId: string;
    brandSettings: PortalBrandConfig;
    children: ReactNode;
}) => {
    return (
        <ClientContext.Provider
            value={{
                clientId: props.clientId,
                brandSettings: props.brandSettings,
            }}
        >
            {props.children}
        </ClientContext.Provider>
    );
};

export default ClientProvider;
