export type * from "../generated/client/index.js";
import type { Font } from "../generated/client/index.js";

// The shape the portal iframe receives from your API — a deliberately
// narrow, public-safe projection of the Customer model.
export type PortalCustomer = {
    id: string;
    email: string;
};

export type CompanyBranding = {
    primary_color: string;
    secondary_color: string;
    selected_fill: string;
    selected_text: string;
    body_text: string;
    button_text: string;
    page_background: string;

    corner_radius: number;
    font: Font;
    logo_url: string | null;
};

export const DEFAULT_COMPANY_BRANDING: CompanyBranding = {
    primary_color: "#0F6E56",
    secondary_color: "#E1F5EE",
    selected_fill: "#E1F5EE",
    selected_text: "#085041",
    body_text: "#000000",
    button_text: "#FFFFFF",
    page_background: "#F5F7F6",
    corner_radius: 12,
    font: "Poppins",
    logo_url: null,
};
