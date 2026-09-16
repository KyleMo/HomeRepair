import { Company, Organization } from "@homerepair/data/types";

export type OrganizationWithCompanies = Organization & { companies: Company[] };

export type OrganizationId = string;
export type CompanyId = string;
