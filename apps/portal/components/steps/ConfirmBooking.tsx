import TextInput from "../generic/TextInput";
import StepTemplate from "./StepTemplate";

const ConfirmBooking = () => {
    return (
        <StepTemplate
            title="Your contact & service details"
            subtitle="Where should we come, and how can we reach you?"
        >
            <TextInput placeholder="Full Name"></TextInput>
        </StepTemplate>
    );
};

export default ConfirmBooking;
