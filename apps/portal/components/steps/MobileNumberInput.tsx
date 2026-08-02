import { useFormContext } from "@/context/hooks";
import TextInput from "../generic/TextInput";
import StepTemplate from "./StepTemplate";
import { formatPhoneNumberProgressive } from "@homerepair/utility";

const MobileNumberInput = () => {
    const { form, dispatch } = useFormContext();

    return (
        <StepTemplate
            title="What's your mobile number?"
            subtitle="We'll check if you're a returning customer and fill in what we already know."
        >
            <TextInput
                value={form.customerDetail.phone}
                onChange={(e) => {
                    const isDeletion = (
                        e.nativeEvent as InputEvent
                    ).inputType?.startsWith("delete");
                    const prevDigits =
                        form.customerDetail.phone.replace(/\D/g, "");
                    let nextDigits = e.target.value.replace(/\D/g, "");
                    // If a deletion only removed an auto-inserted mask char
                    // (the ")" or a space) without changing any digit, drop the
                    // trailing digit so backspace makes progress instead of the
                    // formatter immediately re-adding what was deleted.
                    if (isDeletion && nextDigits === prevDigits) {
                        nextDigits = nextDigits.slice(0, -1);
                    }
                    dispatch({
                        type: "set_customer_detail",
                        customerDetail: {
                            ...form.customerDetail,
                            phone: formatPhoneNumberProgressive(nextDigits),
                        },
                    });
                }}
            ></TextInput>
        </StepTemplate>
    );
};

export default MobileNumberInput;
