"use client";
import { PortalBrandConfig } from "@/models/BrandSettings";
import { ReactNode, createContext, useEffect, useMemo, useState } from "react";

export const ClientContext = createContext<{
    clientId: string;
} | null>(null);

const ClientProvider = (props: { clientId: string; children: ReactNode }) => {
    return (
        <ClientContext.Provider
            value={{
                clientId: props.clientId,
            }}
        >
            {props.children}
        </ClientContext.Provider>
    );
};

export default ClientProvider;
