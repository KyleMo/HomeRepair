import { PropsWithChildren } from "react";
import styles from "./portalbase.module.css";
import { PortalBrandConfig } from "@/models/BrandSettings";
import { brandThemeVars } from "@/lib/color";

const PortalBase = ({
    brandSettings,
    children,
}: PropsWithChildren<{ brandSettings?: PortalBrandConfig }>) => {
    return (
        <main
            // ds-theme redeclares the derived tokens against these overrides.
            className={`${styles.portal} ds-theme`}
            style={brandSettings ? brandThemeVars(brandSettings) : undefined}
        >
            {children}
        </main>
    );
};

export default PortalBase;
