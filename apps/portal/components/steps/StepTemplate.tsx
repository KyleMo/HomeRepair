import { PropsWithChildren } from "react";
import styles from "./steps.module.css";

type StepTemplateProps = PropsWithChildren & {
    title?: string;
    subtitle?: string;
};

const StepTemplate = ({ title, subtitle, children }: StepTemplateProps) => {
    return (
        <div className={styles.portalbody}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            {children}
        </div>
    );
};

export default StepTemplate;
