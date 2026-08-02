import StepTemplate from "./StepTemplate";

const DateSelect = () => {
    return (
        <StepTemplate
            title={"Pick an arrival window"}
            subtitle="Your technician will text when they're on the way."
        >
            <div>Tomorrow, Wed July 8 10AM - 12PM</div>
        </StepTemplate>
    );
};

export default DateSelect;
