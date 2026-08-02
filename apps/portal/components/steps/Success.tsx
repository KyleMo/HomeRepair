import StepTemplate from "./StepTemplate";

const Success = () => {
    return (
        <StepTemplate>
            <h2>You're booked</h2>
            <p>Tomorrow, Wed Jul 8 · 10 AM–12 PM arrival</p>
            <p>
                We just texted your confirmation. Your technician will text when
                they're on the way.
            </p>
            <button>Add to Calendar</button>
            <button>Reschedule</button>
        </StepTemplate>
    );
};
export default Success;
