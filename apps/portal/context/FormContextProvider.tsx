"use client";
import {
    FIRST_FORM_STEP_ID,
    FormAction,
    FormState,
    allSteps,
    defaultCustomerDetail,
} from "@/models/Form";
import {
    createContext,
    useReducer,
    type Dispatch,
    type ReactNode,
} from "react";
import { formReducer } from "./FormReducer";

export const FormContext = createContext<{
    form: FormState;
    dispatch: Dispatch<FormAction>;
} | null>(null);

const FormContextProvider = ({ children }: { children: ReactNode }) => {
    const [form, dispatch] = useReducer(formReducer, {
        cursor: { stepId: FIRST_FORM_STEP_ID },
        progress: 0,
        repairs: [],
        customerDetail: defaultCustomerDetail,
        seenScreen: {},
    });

    return (
        <FormContext.Provider value={{ form, dispatch }}>
            {children}
        </FormContext.Provider>
    );
};

export default FormContextProvider;
