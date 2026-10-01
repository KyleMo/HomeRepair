// TYPES-ONLY entry point — safe to import anywhere, including client
// components and the portal iframe bundle. Contains zero runtime code.

// Re-export all generated Prisma model types (User, Client, Customer, ...)
export type * from "../generated/client/index.js";

// `export type *` above re-exports without importing, so the few names used
// below have to be pulled in explicitly. `import type` is erased at compile
// time, so this entry stays free of the Prisma runtime.
import type { Font } from "../generated/client/index.js";

// Shared hand-written types that all three surfaces care about:

export type UserSettings = {
    theme: "light" | "dark" | "system";
    notifications: boolean;
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
    theme: "system",
    notifications: true,
};

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
