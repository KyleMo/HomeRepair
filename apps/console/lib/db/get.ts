import {
    CompanyId,
    OrganizationId,
    OrganizationWithCompanies,
} from "@/types/organization";
import { Company, prisma } from "@homerepair/data";
import { Result } from "@homerepair/utility/types";

export const userCanAccessCompany = async (
    email: string,
    companyId: string,
) => {
    try {
        const company = await prisma.company.findFirstOrThrow({
            where: {
                id: companyId,
            },
            select: {
                organization_id: true,
            },
        });
        const user = await prisma.user.findFirstOrThrow({
            where: {
                email,
                deactivated_at: null,
            },
            include: {
                membership: true,
            },
        });

        if (!user || !company) return false;

        const foundMembership = user.membership.find(
            (m) =>
                (m.company_id === null &&
                    company.organization_id === m.organization_id) ||
                m.company_id === companyId,
        );

        if (foundMembership) return true;

        return false;
    } catch (error) {
        return false;
    }
};

export type AccessibleScope = {
    // iana timezone
    orgTimezone: string;
    companies: { id: CompanyId; timezone: string }[];
};

export const queryParamterAccumulater = (
    entries: IterableIterator<[key: string, value: any]>,
) => {
    const acc: { [key: string]: string | string[] } = {};
    for (const [key, value] of entries) {
        if (Object.hasOwn(acc, key)) {
            const accValue = acc[key];
            if (Array.isArray(accValue))
                // add to existing array
                accValue.push(value);
            else
                // it becomes an array
                acc[key] = [accValue, value];
        } else acc[key] = value;
    }

    return acc;
};

export const getUsersAccessibleScope = async (
    userId: string,
    orgId: OrganizationId,
): Promise<Result<AccessibleScope>> => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                id: userId,
                deactivated_at: null,
            },
            include: {
                membership: {
                    where: {
                        organization_id: orgId,
                    },
                    include: {
                        company: true,
                    },
                },
            },
        });

        if (!user)
            return {
                success: false,
                error: `Failed to find user with ID ${userId}`,
            };

        const org = await prisma.organization.findFirst({
            where: {
                id: orgId,
            },
            include: {
                companies: {
                    select: {
                        id: true,
                        timezone: true,
                    },
                },
            },
        });

        if (!org)
            return {
                success: false,
                error: `Failed to find organization with ID ${orgId}`,
            };

        if (user.membership.some((m) => m.company_id === null)) {
            return {
                success: true,
                value: {
                    orgTimezone: org.timezone,
                    companies: org.companies.map((c) => ({
                        id: c.id,
                        timezone: c.timezone,
                    })),
                },
            };
        }

        return {
            success: true,
            value: {
                orgTimezone: org.timezone,
                companies: user.membership
                    .filter((m) => !!m.company)
                    .map((m) => m.company)
                    .filter((c): c is Company => !!c)
                    .map((c) => ({ id: c.id, timezone: c.timezone })),
            },
        };
    } catch (error) {
        return {
            success: false,
            error: String(error),
        };
    }
};

export const userCanAccessOrganization = async (
    email: string,
    companyId: string,
) => {
    try {
        const company = await prisma.company.findFirstOrThrow({
            where: {
                id: companyId,
            },
            select: {
                organization_id: true,
            },
        });
        const user = await prisma.user.findFirstOrThrow({
            where: {
                email,
                deactivated_at: null,
            },
            include: {
                membership: true,
            },
        });

        if (!user || !company) return false;

        const foundMembership = user.membership.find(
            (m) =>
                (m.company_id === null &&
                    company.organization_id === m.organization_id) ||
                m.company_id === companyId,
        );

        if (foundMembership) return true;

        return false;
    } catch (error) {
        return false;
    }
};

export const getOrganizationsByUserEmail = async (
    email: string,
): Promise<Result<OrganizationWithCompanies[]>> => {
    try {
        const user = await prisma.user.findFirstOrThrow({
            where: {
                email,
                deactivated_at: null,
            },
            include: {
                membership: true,
            },
        });

        // Org-wide memberships (company_id === null) grant access to every
        // company in that organization.
        const orgWideOrgIds = user.membership
            .filter((m) => m.company_id === null)
            .map((m) => m.organization_id);

        // Company-scoped memberships grant access to just that company.
        const specificCompanyIds = user.membership
            .map((m) => m.company_id)
            .filter((cid): cid is string => cid !== null);

        // Return each accessible organization with only the companies the user
        // can see nested inside it.
        const organizations = await prisma.organization.findMany({
            where: {
                OR: [
                    // Orgs the user has org-wide access to...
                    { id: { in: orgWideOrgIds } },
                    // ...plus orgs that contain a specifically-granted company.
                    { companies: { some: { id: { in: specificCompanyIds } } } },
                ],
            },
            include: {
                companies: {
                    where: {
                        OR: [
                            // All companies of an org-wide org...
                            { organization_id: { in: orgWideOrgIds } },
                            // ...plus individually-granted companies.
                            { id: { in: specificCompanyIds } },
                        ],
                    },
                },
            },
        });

        return { success: true, value: organizations };
    } catch (error) {
        return {
            success: false,
            error: `An error occured fetching user companies with email: ${email}. Error: ${error}`,
        };
    }
};
