import { useState } from "react";
import { useFormContext } from "../../context/hooks";
import styles from "./steps.module.css";
import Pill from "../generic/Pill";
import TextInput from "../generic/TextInput";
import StepTemplate from "./StepTemplate";

const options = [
    { id: "1", label: "Won't drain" },
    { id: "2", label: "Won't spin" },
    { id: "3", label: "Won't start" },
    { id: "4", label: "Leaking" },
    { id: "5", label: "Loud/Shaking" },
    { id: "6", label: "Stops mid-cycle" },
    { id: "7", label: "Something else" },
];

const IssueSelection = () => {
    const { form, dispatch } = useFormContext();
    const repair = form.repairs.find((r) => r.id === form.cursor.repairId);

    if (!repair) {
        return <div>Please go back and select an item to repair</div>;
    }

    const handleBrandClick = (id?: string) => {
        dispatch({ type: "update_repair", repair: { ...repair, modelId: id } });
    };

    return (
        <StepTemplate
            title={`What's the issue with your of your ${repair.label.toLocaleLowerCase()}?`}
            subtitle="Select all that apply."
        >
            <div className={styles.flexWrapContainer}>
                {options.map((o) => {
                    return (
                        <Pill
                            key={o.id}
                            id={o.id}
                            onClick={() => handleBrandClick(o.id)}
                        >
                            {o.label}
                        </Pill>
                    );
                })}
            </div>
        </StepTemplate>
    );
};

export default IssueSelection;
