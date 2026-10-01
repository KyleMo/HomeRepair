import { useFormContext } from "@/context/hooks";
import { allSteps } from "@/models/Form";
import Header from "./Header";
import Footer from "./Footer";

const PortalForm = () => {
    const { form } = useFormContext();
    const step = allSteps[form.cursor.stepId];

    if (!step) {
        return <h2>Failed to find current step</h2>;
    }
    return (
        <>
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
        </>
    );
};

export default PortalForm;
