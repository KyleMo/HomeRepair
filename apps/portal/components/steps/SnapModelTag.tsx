import { useFormContext } from "@/context/hooks";
import TextInput from "../generic/TextInput";
import { RefrigeratorIcon } from "../icons";
import StepTemplate from "./StepTemplate";
import styles from "./steps.module.css";
import { APPLIANCES } from "@/models/Form";

const SnapModelTag = () => {
    const { form, dispatch } = useFormContext();
    const repair = form.repairs.find((r) => r.id === form.cursor.repairId);

    if (!repair) {
        return <div>Please go back and select an item to repair</div>;
    }

    const Icon =
        APPLIANCES.find((app) => app.id === repair.id)?.Icon ??
        RefrigeratorIcon;

    return (
        <StepTemplate
            title="Snap the model tag"
            subtitle="Helps us bring the right parts and it can save you a second visit."
        >
            <div
                className={styles.flexRow}
                style={{ justifyContent: "center", width: "100%" }}
            >
                <div className={styles.snapModelBoxInstruction}>
                    <Icon className={styles.snapModelIcon} />
                    <p>
                        The tag is inside the fridge, on the side wall near the
                        crisper drawers.
                    </p>
                </div>
            </div>

            <span>Or type the model number</span>
            <TextInput placeholder="e.g. WTW5000DW"></TextInput>
        </StepTemplate>
    );
};

export default SnapModelTag;
