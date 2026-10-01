import {
    FormAction,
    FormState,
    buildStepScreens,
    indexOfStep,
    Screen,
    StepCursor,
    allSteps,
} from "@/models/Form";

const screenToCursor = (screen?: Screen): StepCursor | null => {
    if (!screen) return null;
    switch (screen.kind) {
        case "global":
            return { stepId: screen.id };
        case "repair":
            return { stepId: screen.id, repairId: screen.repairId };
    }
};

type ScreenLocation = {
    index: number;
    /** False when the cursor's own screen is gone and this is a recovery. */
    exact: boolean;
};

const locateCursor = (
    screens: Screen[],
    cursor: StepCursor,
): ScreenLocation => {
    const exact = indexOfStep(screens, cursor);
    if (exact !== -1) return { index: exact, exact: true };

    const sameStep = screens.findIndex((screen) => screen.id === cursor.stepId);
    return { index: sameStep === -1 ? 0 : sameStep, exact: false };
};

export function formReducer(state: FormState, action: FormAction): FormState {
    switch (action.type) {
        case "set_customer_detail": {
            return {
                ...state,
                customerDetail: action.customerDetail,
            };
        }
        case "set_repairs":
            return { ...state, repairs: action.repairs };
        case "toggle_repair": {
            // Also adds steps into flow
            const repairExists = state.repairs.some(
                (r) => r.id === action.repair.id,
            );
            if (repairExists)
                return {
                    ...state,
                    repairs: state.repairs.filter(
                        (r) => r.id !== action.repair.id,
                    ),
                };
            return { ...state, repairs: [...state.repairs, action.repair] };
        }
        case "update_repair": {
            const repairs = [...state.repairs];
            const index = repairs.findIndex((r) => r.id === action.repair.id);

            if (index === -1) {
                console.warn(
                    `Failed to update repair with ID: ${action.repair.id}`,
                );
                return state;
            }

            repairs[index] = action.repair;
            return {
                ...state,
                repairs,
            };
        }
        case "next_step": {
            const currStep = allSteps[state.cursor.stepId];
            if (!currStep) return state;

            const seenScreen = { ...state.seenScreen, [currStep.id]: true };

            const screensArray: Screen[] = buildStepScreens({
                ...state,
                seenScreen,
            });
            const { index: currIndex, exact } = locateCursor(
                screensArray,
                state.cursor,
            );

            // A recovered cursor moves *to* the surviving screen rather than
            // past it — the customer never completed the one that vanished.
            const nextIndex = exact
                ? Math.min(currIndex + 1, screensArray.length - 1)
                : currIndex;
            const next = screensArray[nextIndex];

            if (!next) return state;

            const newCursor = screenToCursor(next);

            if (!newCursor) return state;
            // subtract one because we want the last confirm page to be 100%
            const progress = nextIndex / (screensArray.length - 1);

            return {
                ...state,
                seenScreen,
                cursor: newCursor,
                progress,
            };
        }
        case "back_step": {
            const currStep = allSteps[state.cursor.stepId];
            if (!currStep) return state;

            const seenScreen = { ...state.seenScreen, [currStep.id]: true };

            const screensArray: Screen[] = buildStepScreens({
                ...state,
                seenScreen,
            });
            const { index: currIndex, exact } = locateCursor(
                screensArray,
                state.cursor,
            );

            const prevIndex = exact ? Math.max(currIndex - 1, 0) : currIndex;
            const prev = screensArray[prevIndex];

            if (!prev) return state;

            const prevCursor = screenToCursor(prev);

            if (!prevCursor) return state;

            const progress = prevIndex / (screensArray.length - 1);

            return {
                ...state,
                seenScreen,
                cursor: prevCursor,
                progress,
            };
        }
        default:
            return state;
    }
}
