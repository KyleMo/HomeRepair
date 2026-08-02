import AddressInput from "@/components/steps/AddressInput";
import { Result } from "./Result";
import BrandSelection from "@/components/steps/BrandSelection";
import ApplianceSelection from "@/components/steps/ApplianceSelection";
import DateSelect from "@/components/steps/DateSelect";
import IssueSelection from "@/components/steps/IssueSelection";
import Confirm from "@/components/steps/Success";
import SnapModelTag from "@/components/steps/SnapModelTag";
import { ComponentType, SVGProps } from "react";
import {
    RefrigeratorIcon,
    WasherIcon,
    DryerIcon,
    DishwasherIcon,
    RangeIcon,
    OvenIcon,
    MicrowaveIcon,
    IceMakerIcon,
    GarbageDisposalIcon,
    WineCoolerIcon,
} from "@/components/icons";
import ConfirmBooking from "@/components/steps/ConfirmBooking";

export type StepId = string;
// UUID
export type IssueId = string;
export type BrandId = string;

export const FIRST_FORM_STEP_ID: StepId = "hr_appliance";
export const FINAL_CONFIRM_STEP_ID: StepId = "hr_confirm_step";

export type ListItem = { id: string; label: string };

export const globalInitSteps: FormStep[] = [
    {
        id: FIRST_FORM_STEP_ID,
        title: "What needs repair?",
        subtitle: "Tap the appliance(s) giving you trouble.",
        validate: (state: FormState) => {
            if (state.repairs.length <= 0)
                return {
                    success: false,
                    error: "Please select one or more repairs",
                };
            return { success: true, value: "ok" };
        },
        Component: ApplianceSelection,
        hasFooter: true,
        canSkip: false,
    },
];
const perRepairSteps: FormStep[] = [
    {
        id: "hr_brand",
        Component: BrandSelection,
        validate: (form: FormState) => {
            const repair = form.repairs.find(
                (r) => r.id === form.cursor.repairId,
            );
            if (!repair)
                return { success: false, error: "Failed to find repair" };

            if (!repair.brandId) {
                return {
                    success: false,
                    error: `Please assigning a brand to the ${repair.label.toLocaleLowerCase()}`,
                };
            }
            return { success: true, value: "ok" };
        },
        hasFooter: true,
        canSkip: false,
    },
    {
        id: "hr_issue_select",
        Component: IssueSelection,
        validate: () => {
            return { success: true, value: "ok" };
        },
        hasFooter: true,
        canSkip: false,
    },
    {
        id: "hr_snap_model_tag",
        Component: SnapModelTag,
        validate: () => {
            return { success: true, value: "ok" };
        },
        hasFooter: true,
        canSkip: true,
    },
];
const globalFinalSteps: FormStep[] = [
    // Remove these steps as they currently aren't needed
    // {
    //     id: "hr_mobile_phone",
    //     validate: () => {
    //         return { success: true, value: "ok" };
    //     },
    //     Component: MobileNumberInput,
    //     hasFooter: true,
    //     canSkip: true,
    // },
    // {
    //     id: "hr_mobile_phone_confirmation",
    //     validate() {
    //         return { success: true, value: "ok" };
    //     },
    //     Component: MobilePhoneConfirmation,
    //     hasFooter: true,
    //     canSkip: false,
    // },
    {
        id: "hr_address_input",
        validate: (state) => {
            if (
                !/(^\d{5}$)|(^\d{5}-\d{4}$)/.test(
                    state.customerDetail.address.zipcode,
                )
            ) {
                return {
                    success: false,
                    error: "Invalid zipcode entered",
                };
            }
            return { success: true, value: "ok" };
        },
        Component: AddressInput,
        hasFooter: true,
        canSkip: false,
        includeInFlow: (state) => {
            return !state.customerDetail.address.zipcode;
        },
    },
    // {
    //     id: "hr_address_confirmation",
    //     Component: AddressConfirmation,
    //     validate: () => {
    //         return { success: true, value: "ok" };
    //     },
    //     hasFooter: true,
    //     canSkip: false,
    //     includeInFlow(state) {
    //         return !!state.customerDetail.customerId;
    //     },
    // },
    {
        id: "hr_arrival_window",
        Component: DateSelect,
        validate: () => {
            return { success: true, value: "ok" };
        },
        hasFooter: true,
        canSkip: false,
    },
    {
        id: "hr_confirm_booking",
        Component: ConfirmBooking,
        validate: () => {
            return { success: true, value: "ok" };
        },
        hasFooter: true,
        canSkip: false,
        nextButtonText: "Confirm Booking",
    },
    {
        id: "hr_success_step",
        Component: Confirm,
        validate: () => {
            return { success: true, value: "ok" };
        },
        hasFooter: true,
        nextButtonText: "Book",
        canSkip: false,
    },
];

export const allSteps = [
    ...globalInitSteps,
    ...perRepairSteps,
    ...globalFinalSteps,
].reduce<{ [key: string]: FormStep }>((acc, curr) => {
    acc[curr.id as string] = curr;
    return acc;
}, {});

export type Screen =
    | { kind: "global"; id: StepId }
    | { kind: "repair"; id: StepId; repairId: string };

export const indexOfStep = (stepArray: Screen[], cursor: StepCursor) => {
    return stepArray.findIndex(
        (s) =>
            s.id === cursor.stepId &&
            (s.kind === "repair" ? s.repairId === cursor.repairId : true),
    );
};

const screenFilterFunc =
    (state: FormState) =>
    (step: FormStep): boolean => {
        // No predicate ⇒ always included.
        // if include in flow function exists and the screen hasn't been seen yet
        return step.includeInFlow && !state.seenScreen[step.id]
            ? step.includeInFlow(state)
            : true;
    };

/** IMPORTANT: This function drives navigation for the entire portal. Conditional steps only works by using state set before trying to render said conditional step */
export const buildStepScreens = (state: FormState): Screen[] => {
    return [
        ...globalInitSteps
            .filter(screenFilterFunc(state))
            .map((s): Screen => ({ kind: "global", id: s.id })),
        ...state.repairs.flatMap((r) =>
            perRepairSteps.filter(screenFilterFunc(state)).map(
                (s): Screen => ({
                    kind: "repair",
                    id: s.id,
                    repairId: r.id,
                }),
            ),
        ),
        ...globalFinalSteps
            .filter(screenFilterFunc(state))
            .map((s): Screen => ({ kind: "global", id: s.id })),
    ];
};

export type FormAction =
    | { type: "set_customer_detail"; customerDetail: CustomerDetail }
    | { type: "set_phone"; phone: string }
    | { type: "set_progress"; progress: number }
    | { type: "set_repairs"; repairs: Repair[] }
    | { type: "update_repair"; repair: Repair }
    | { type: "add_repair"; repair: Repair }
    | { type: "update_repair"; repair: Repair }
    | { type: "remove_repair"; id: string }
    | { type: "toggle_repair"; repair: Repair }
    | { type: "next_step" }
    | { type: "back_step" };

export type Address = {
    street: string;
    city: string;
    state: string;
    zipcode: string;
    formattedAddress: string;
};

export type CustomerDetail = {
    customerId: string;
    fullName: string;
    phone: string;
    address: Address;
};

export const defaultCustomerDetail: CustomerDetail = {
    customerId: "",
    fullName: "",
    phone: "",
    address: {
        street: "",
        city: "",
        state: "",
        zipcode: "",
        formattedAddress: "",
    },
};

export type Repair = {
    id: string;
    label: string;
    brandId?: BrandId;
    issues: IssueId[];
};

export type Model = {
    id: string;
    label: string;
};

export type StepCursor = {
    stepId: string;
    repairId?: string;
};

export type FormState = {
    customerDetail: CustomerDetail;
    cursor: StepCursor;
    repairs: Repair[];
    progress: number;
    // if we have already seen a screen and its filter out state is true we still want to keep the screen
    seenScreen: { [key: StepId]: boolean };
};

export type FormStep = {
    id: StepId;
    validate: (state: FormState) => Result<string>;
    includeInFlow?: (state: FormState) => boolean;
    hasFooter: boolean;
    canSkip: boolean;
    title?: string;
    Component: React.ComponentType;
    subtitle?: string;
    errorPageId?: StepId;
    nextButtonText?: string;
    skipButtonText?: string;
};

type Appliance = {
    id: string;
    label: string;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const APPLIANCES: Appliance[] = [
    { id: "refrigerator", label: "Refrigerator", Icon: RefrigeratorIcon },
    { id: "washer", label: "Washer", Icon: WasherIcon },
    { id: "dryer", label: "Dryer", Icon: DryerIcon },
    { id: "dishwasher", label: "Dishwasher", Icon: DishwasherIcon },
    { id: "range", label: "Range / stove", Icon: RangeIcon },
    { id: "oven", label: "Oven", Icon: OvenIcon },
    { id: "microwave", label: "Microwave", Icon: MicrowaveIcon },
    { id: "ice-maker", label: "Ice maker", Icon: IceMakerIcon },
    {
        id: "garbage-disposal",
        label: "Garbage disposal",
        Icon: GarbageDisposalIcon,
    },
    { id: "wine-cooler", label: "Wine cooler", Icon: WineCoolerIcon },
];
