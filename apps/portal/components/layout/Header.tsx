"use client";
import { useFormContext } from "../../context/hooks";
import { ChevronLeftIcon, CloseIcon, PhoneIcon } from "../icons";
import IconButton from "../generic/Button";
import styles from "./header.module.css";
import { formatPhoneNumber } from "@homerepair/utility";

type HeaderProps = {
    progress: number;
};

const Header = ({ progress }: HeaderProps) => {
    const { dispatch } = useFormContext();
    const closeModal = () => {
        window.parent.postMessage("close", "*");
    };
    const businessName = "Reyes Appliance Repair";

    return (
        <header className={styles.header}>
            <div className={styles.bar}>
                <IconButton onClick={() => dispatch({ type: "back_step" })}>
                    <ChevronLeftIcon
                        viewBox="0 0 24 24"
                        width={24}
                        height={24}
                    />
                </IconButton>
                <span className={styles.avatar} aria-hidden>
                    RA
                </span>
                <span className={styles.name} title={businessName}>
                    {businessName}
                </span>
                <IconButton onClick={closeModal}>
                    <CloseIcon
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="black"
                    />
                </IconButton>
            </div>
            <div
                className={styles.progress}
                role="progressbar"
                aria-valuenow={Math.round(progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <span
                    className={styles.progressFill}
                    style={{
                        width: `${Math.min(Math.max(progress, 0), 1) * 100}%`,
                    }}
                />
            </div>
        </header>
    );
};

export default Header;
