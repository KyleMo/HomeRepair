"use client";
import type { ButtonHTMLAttributes } from "react";
import styles from "./button.module.css";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({
    type = "button",
    className,
    children,
    ...props
}: IconButtonProps) => {
    return (
        <button
            type={type}
            className={
                className ? `${styles.button} ${className}` : styles.button
            }
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
