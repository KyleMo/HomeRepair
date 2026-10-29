import { useClient, useFormContext } from "../../context/hooks";
import styles from "./steps.module.css";
import Pill from "../generic/Pill";
import StepTemplate from "./StepTemplate";

const SymptomSelection = () => {
    const { symptoms } = useClient();
    const { form, dispatch } = useFormContext();
    const repair = form.repairs.find((r) => r.id === form.cursor.repairId);

    if (!repair) {
        return <div>Please go back and select an item to repair</div>;
    }

    let filterSymptoms = symptoms.filter(
        (s) =>
            s.appliance_type_id === repair.applianceTypeId &&
            s.brand_id === null,
    );

    if (repair.brandId) {
        filterSymptoms = symptoms.filter(
            (s) =>
                s.appliance_type_id === repair.applianceTypeId &&
                (s.brand_id === null || s.brand_id === repair.brandId),
        );
    }

    const handleSymptomClick = (id: string) => {
        const newSymptoms = repair.symptoms.includes(id)
            ? repair.symptoms.filter((symptomId) => symptomId !== id)
            : [...repair.symptoms, id];
        dispatch({
            type: "update_repair",
            repair: { ...repair, symptoms: newSymptoms },
        });
    };

    return (
        <StepTemplate
            title={`What's the issue with your of your ${repair.name.toLocaleLowerCase()}?`}
            subtitle="Select all that apply."
        >
            <div className={styles.flexWrapContainer}>
                {filterSymptoms.map((s) => {
                    return (
                        <Pill
                            key={s.id}
                            id={s.id}
                            selected={repair.symptoms.includes(s.id)}
                            onClick={() => handleSymptomClick(s.id)}
                        >
                            {s.name}
                        </Pill>
                    );
                })}
            </div>
        </StepTemplate>
    );
};

export default SymptomSelection;
