"use client";
import { useState } from "react";
import styles from "./steps.module.css";
import { useClient, useFormContext } from "../../context/hooks";
import StepTemplate from "./StepTemplate";

const ApplianceSelection = () => {
    const { services } = useClient();
    const { form, dispatch } = useFormContext();
    const [showMore, setShowMore] = useState<boolean>(false);

    return (
        <StepTemplate
            title="What needs repair?"
            subtitle="Tap the appliance(s) giving you trouble."
        >
            <ul className={styles.grid}>
                {services.map(
                    ({
                        id: companyServiceId,
                        appliance_type: { id: applianceTypeId, name },
                    }) => {
                        const existing = form.repairs.find(
                            (r) => r.companyServiceId === companyServiceId,
                        );
                        return (
                            <li key={companyServiceId}>
                                <button
                                    type="button"
                                    className={styles.card}
                                    aria-pressed={!!existing}
                                    onClick={() =>
                                        existing
                                            ? dispatch({
                                                  type: "remove_repair",
                                                  id: existing.id,
                                              })
                                            : dispatch({
                                                  type: "add_repair",
                                                  repair: {
                                                      id: crypto.randomUUID(),
                                                      companyServiceId,
                                                      applianceTypeId,
                                                      name,
                                                      symptoms: [],
                                                  },
                                              })
                                    }
                                >
                                    <span className={styles.iconWrap}>
                                        {/* <Icon className={styles.icon} /> */}
                                    </span>
                                    <span className={styles.label}>{name}</span>
                                </button>
                            </li>
                        );
                    },
                )}
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
