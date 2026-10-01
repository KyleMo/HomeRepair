import { PropsWithChildren } from "react";
import styles from "./portalbase.module.css";

const PortalBase = ({ children }: PropsWithChildren) => {
    return <main className={styles.portal}>{children}</main>;
};

export default PortalBase;
