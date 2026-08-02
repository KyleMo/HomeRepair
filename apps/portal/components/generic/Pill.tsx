"use client";
import type { HTMLAttributes, MouseEventHandler } from "react";
import styles from "./pill.module.css";

type PillVariant = "neutral" | "brand" | "accent" | "outline";
type PillSize = "sm" | "md";

type PillProps = HTMLAttributes<HTMLSpanElement> & {
    variant?: PillVariant;
    size?: PillSize;
    /** When provided, renders a dismiss (×) button and calls this on click. */
    onRemove?: MouseEventHandler<HTMLButtonElement>;
    /** Accessible label for the remove button. Defaults to "Remove". */
    removeLabel?: string;
};

const Pill = ({
    onRemove,
    removeLabel = "Remove",
    className,
    children,
    ...props
}: PillProps) => {
    const classes = [styles.pill, styles.outline, styles.md, className]
        .filter(Boolean)
        .join(" ");

    return (
        <span className={classes} {...props}>
            <span className={styles.label}>{children}</span>
            {onRemove && (
                <button
                    type="button"
                    className={styles.remove}
                    aria-label={removeLabel}
                    onClick={onRemove}
                >
                    ×
                </button>
            )}
        </span>
    );
};

export default Pill;
