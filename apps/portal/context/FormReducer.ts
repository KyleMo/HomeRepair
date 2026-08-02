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

            if (index <= -1) {
                console.warn(
                    `Failed to update repair with ID: ${action.repair.id}`,
                );
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

            // update seen screens
            if (!state.seenScreen[currStep.id])
                state.seenScreen = {
                    ...state.seenScreen,
                    [currStep.id]: true,
                };

            const screensArray: Screen[] = buildStepScreens(state);
            const currIndex = indexOfStep(screensArray, state.cursor);

            const nextIndex = Math.min(currIndex + 1, screensArray.length - 1);
            const next = screensArray[nextIndex];

            if (!next) return state;

            const newCursor = screenToCursor(next);

            if (!newCursor) return state;
            // subtract one because we want the last confirm page to be 100%
            const progress = nextIndex / (screensArray.length - 1);

            return {
                ...state,
                cursor: newCursor,
                progress,
            };
        }
        case "back_step": {
            const currStep = allSteps[state.cursor.stepId];
            if (!currStep) return state;

            const screensArray: Screen[] = buildStepScreens(state);
            const currIndex = indexOfStep(screensArray, state.cursor);

            const prevIndex = Math.max(currIndex - 1, 0);
            const prev = screensArray[prevIndex];

            if (!prev) return state;

            const prevCursor = screenToCursor(prev);

            if (!prevCursor) return state;

            const progress = prevIndex / (screensArray.length - 1);

            return {
                ...state,
                cursor: prevCursor,
                progress,
            };
        }
        default:
            return state;
    }
}
