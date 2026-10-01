"use client";
import { PortalBrandConfig } from "@/models/BrandSettings";
import { ReactNode, createContext, useEffect, useMemo, useState } from "react";

/**
 * Only ever provided once both values exist — the loading, error and
 * missing-id cases render instead of the children — so consumers get plain
 * values rather than maybes.
 */
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
