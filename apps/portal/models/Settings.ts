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

export type PortalSymptom = {
    name: string;
    id: string;
    appliance_type_id: ApplianceTypeId;
    brand_id: string | null;
    description: string;
};

type DurationOverride = {
    duration_minutes: number;
    symptom_id: string | null;
    brand_id: string | null;
    company_service_id: CompanyServiceId;
};

export type ApplianceTypeId = string;
export type CompanyServiceId = string;
export type PortalService = {
    id: CompanyServiceId;
    appliance_type: {
        id: string;
        name: string;
        //default_job_duration_minutes: number;
        symptoms: PortalSymptom[];
    };
    duration_overrides: DurationOverride[];
};
