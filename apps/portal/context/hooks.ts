import { Dispatch, useContext } from "react";
import { FormContext } from "./FormContextProvider";
import { FormAction, FormState } from "@/models/Form";
import { ClientContext } from "./ClientProvider";
import { SessionContext } from "./SessionProvider";

export const useFormContext = (): {
    form: FormState;
    dispatch: Dispatch<FormAction>;
} => {
    const ctx = useContext(FormContext);
    if (!ctx)
        throw new Error(
            "useFormContext must be used within PortalContextProvider",
        );
    return ctx;
};

export const useClient = () => {
    const ctx = useContext(ClientContext);
    if (!ctx) {
        throw new Error("useClientId must be used within ClientProvider");
    }
    return ctx;
};

export const usePortalSession = () => {
    const ctx = useContext(SessionContext);
    if (!ctx)
        throw new Error("usePortalSession must be used within SessionProvider");
    return ctx;
};
