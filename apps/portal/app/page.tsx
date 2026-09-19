"use client";
import Header from "../components/layout/Header";
import styles from "./page.module.css";
import { useFormContext } from "@/context/hooks";
import Footer from "@/components/layout/Footer";
import { allSteps } from "@/models/Form";

export default function PortalHome() {
    const { form } = useFormContext();
    const step = allSteps[form.cursor.stepId];

    if (!step) {
        return <h2>Failed to find current step</h2>;
    }

    return (
        <main className={styles.portal}>
            <Header progress={form.progress} />
            <step.Component />
            {step.hasFooter && <Footer />}
            <div
                style={{
                    position: "fixed",
                    fontSize: 10,
                    marginLeft: 10,
                    bottom: 5,
                    left: 5,
                }}
            >
                Powered by HomeRepair
            </div>
        </main>
    );
}
