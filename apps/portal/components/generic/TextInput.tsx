import { InputHTMLAttributes } from "react";
import styles from "./textinput.module.css";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
    inputType?: "text" | "zipcode" | "number" | "phone";
};

const TextInput = ({ inputType = "text", ...props }: TextInputProps) => {
    const onChangeWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!props.onChange) return;
        switch (inputType) {
            case "zipcode": {
                // Allow partial + complete US ZIP / ZIP+4: 12345 or 12345-6789
                if (/^\d{0,5}(-\d{0,4})?$/.test(e.target.value))
                    return props.onChange(e);
                return;
            }
            case "number": {
                if (e.target.value !== "" && isNaN(Number(e.target.value)))
                    return;
                return props.onChange(e);
            }
            case "text":
                return props.onChange(e);
        }
    };
    return (
        <input
            {...props}
            onChange={(e) => onChangeWrapper(e)}
            className={styles.textInput}
        ></input>
    );
};

export default TextInput;
