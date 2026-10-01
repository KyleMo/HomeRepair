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
    useCallback,
    useReducer,
    type Dispatch,
    type ReactNode,
} from "react";
import { formReducer } from "./FormReducer";
import { usePortalSession } from "./hooks";

export const FormContext = createContext<{
    form: FormState;
    dispatch: Dispatch<FormAction>;
} | null>(null);

const FormContextProvider = ({ children }: { children: ReactNode }) => {
    const { getSession, init, touch } = usePortalSession();
    const [form, rawDispatch] = useReducer(formReducer, {
        cursor: { stepId: FIRST_FORM_STEP_ID },
        progress: 0,
        repairs: [],
        customerDetail: defaultCustomerDetail,
        seenScreen: {},
    });

    const dispatch = useCallback(
        (action: FormAction) => {
            const session = getSession();
            if (!session) init();
            else touch();
            rawDispatch(action);
        },
        [getSession, init, touch],
    );

    return (
        <FormContext.Provider value={{ form, dispatch }}>
            {children}
        </FormContext.Provider>
    );
};

export default FormContextProvider;
