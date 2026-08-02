import { Dispatch, useContext } from "react";
import { FormContext } from "./FormContextProvider";
import { FormAction, FormState } from "@/models/Form";

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
