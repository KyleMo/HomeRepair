"use client";
import { useState } from "react";
import styles from "./steps.module.css";
import { useFormContext } from "../../context/hooks";
import StepTemplate from "./StepTemplate";
import { APPLIANCES } from "@/models/Form";

const ApplianceSelection = () => {
    const { form, dispatch } = useFormContext();
    const [showMore, setShowMore] = useState<boolean>(false);

    const filteredAppliance = showMore ? APPLIANCES : APPLIANCES.slice(0, 6);
    return (
        <StepTemplate
            title="What needs repair?"
            subtitle="Tap the appliance(s) giving you trouble."
        >
            <ul className={styles.grid}>
                {filteredAppliance.map(({ id, label, Icon }) => {
                    const active = form.repairs.some((r) => r.id === id);
                    return (
                        <li key={id}>
                            <button
                                type="button"
                                className={styles.card}
                                aria-pressed={active}
                                onClick={() =>
                                    dispatch({
                                        type: "toggle_repair",
                                        repair: { id, label, issues: [] },
                                    })
                                }
                            >
                                <span className={styles.iconWrap}>
                                    <Icon className={styles.icon} />
                                </span>
                                <span className={styles.label}>{label}</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
            <div
                onClick={() => setShowMore((prev) => !prev)}
                style={{ cursor: "pointer" }}
            >
                Show More
            </div>
        </StepTemplate>
    );
};

export default ApplianceSelection;
