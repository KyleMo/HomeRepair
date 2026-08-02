import { allSteps } from "@/models/Form";
import { useFormContext } from "../../context/hooks";
import styles from "./footer.module.css";

const Footer = () => {
    const { form, dispatch } = useFormContext();
    const step = allSteps[form.cursor.stepId];

    const isValid = step?.validate(form).success;

    return (
        <footer className={styles.footer}>
            <button
                disabled={!isValid}
                className={styles.footerContinue}
                onClick={() => {
                    if (step) {
                        const requirementsSatisfied = step.validate(form);
                        if (!requirementsSatisfied.success) {
                            console.warn(requirementsSatisfied.error);
                            return;
                        }
                    }
                    dispatch({ type: "next_step" });
                }}
            >
                {step?.nextButtonText ?? "Next"}
            </button>
            {step?.canSkip && (
                <button
                    className={styles.footerSkip}
                    onClick={() => {
                        dispatch({ type: "next_step" });
                    }}
                >
                    Skip
                </button>
            )}
        </footer>
    );
};

export default Footer;
