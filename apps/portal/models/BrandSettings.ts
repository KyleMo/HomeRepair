import { CompanyBranding } from "@homerepair/data/types";

export type PortalBrandConfig = CompanyBranding & {
    company_name: string;
};

export type ColorField =
    | "primary_color"
    | "secondary_color"
    | "selected_fill"
    | "selected_text"
    | "body_text"
    | "button_text"
    | "page_background";
