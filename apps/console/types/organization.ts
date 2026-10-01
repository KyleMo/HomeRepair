import { Company, Organization } from "@homerepair/data/types";
import z from "zod";

export type OrganizationWithCompanies = Organization & { companies: Company[] };

export type OrganizationId = string;
export type CompanyId = string;

export const overviewQuerySchema = z.object({
    from: z.coerce.date().nullish(),
    to: z.coerce.date().nullish(),
    limit: z.coerce.number().int().positive().max(200).optional(),
});
