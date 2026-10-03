import { ColorField, PortalBrandConfig } from "@/models/BrandSettings";
import { DEFAULT_COMPANY_BRANDING } from "@homerepair/data";
import { validateHexColor } from "@homerepair/utility";
import { CSSProperties } from "react";

// falls back to the default for any colour that fails validation
export const color = (
    b: PortalBrandConfig,
    field: ColorField & keyof typeof DEFAULT_COMPANY_BRANDING,
) => {
    const hex = validateHexColor(b[field]);
    if (hex) return hex;

    console.warn(
        `[brandThemeVars] ${b.company_name}: invalid ${field} "${b[field]}", using default`,
    );
    return DEFAULT_COMPANY_BRANDING[field] as string;
};

export function brandThemeVars(b: PortalBrandConfig): CSSProperties {
    const radius = Number.isFinite(b.corner_radius)
        ? b.corner_radius
        : DEFAULT_COMPANY_BRANDING.corner_radius;

    return {
        "--ds-color-primary": color(b, "primary_color"),
        "--ds-color-secondary": color(b, "secondary_color"),
        "--ds-color-selected-fill": color(b, "selected_fill"),
        "--ds-color-selected-text": color(b, "selected_text"),
        "--ds-color-text": color(b, "body_text"),
        "--ds-color-button-text": color(b, "button_text"),
        "--ds-color-page-bg": color(b, "page_background"),
        "--ds-radius-md": `${radius}px`,
    } as CSSProperties;
}
