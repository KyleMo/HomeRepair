import { PropsWithChildren } from "react";
import styles from "./consolelayout.module.css";

type ConsoleLayoutProps = PropsWithChildren;

const ConsoleLayout = ({ children }: ConsoleLayoutProps) => {
    return (
        <main className={styles.paneLayout}>
            <nav>
                <span>Overview</span>
                <span>Settings</span>
            </nav>
            <section>{children}</section>
        </main>
    );
};

export default ConsoleLayout;
