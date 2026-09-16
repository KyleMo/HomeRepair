import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "./auth";
import { getUsersAccessibleScope, userCanAccessCompany } from "@/lib/db/get";
import { CompanyId, OrganizationId } from "@/types/organization";
import z from "zod";

type CompanyEndpointFunc = (
    req: NextRequest,
    ctx: {
        session: Session;
        companyId: CompanyId;
    },
) => Promise<Response>;

type CompanyRouteContext = {
    params: Promise<{ companyId: CompanyId }>;
};

/**
 * For resources that belong to one company rather than to the organization —
 * settings being the first of them. The company is named by the path, so
 * there's no companyIds query string to validate: a user either has a
 * membership covering that company (directly or org-wide) or the route 404s.
 */
export function withCompanyAccess(handler: CompanyEndpointFunc) {
    return async function companyRoute(
        req: NextRequest,
        { params }: CompanyRouteContext,
    ) {
        const session = await requireSession();

        if (!session)
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );

        const { companyId } = await params;

        // 404 rather than 403: a company the user can't reach shouldn't be
        // distinguishable from one that doesn't exist.
        if (!(await userCanAccessCompany(session.user.email, companyId)))
            return NextResponse.json({ error: "Not found" }, { status: 404 });

        return handler(req, { session, companyId });
    };
}

type EndpointFunc = (
    req: NextRequest,
    ctx: {
        session: Session;
        organizationId: OrganizationId;
        companyIds: CompanyId[];
        groupingTimezone: string;
    },
) => Promise<Response>;

type OrganizationRouteContext = {
    params: Promise<{
        organizationId: OrganizationId;
        companyIds: CompanyId[];
    }>;
};

const companyIdRequiment = z.object({
    companyIds: z.array(z.string()).nullish(),
});

export function withOrgAccess(handler: EndpointFunc) {
    return async function organizationRoute(
        req: NextRequest,
        { params }: OrganizationRouteContext,
    ) {
        const session = await requireSession();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { organizationId } = await params;
        const accessibleScopeResult = await getUsersAccessibleScope(
            session.user.user_id,
            organizationId,
        );

        if (
            !accessibleScopeResult.success ||
            accessibleScopeResult.value.companies.length <= 0
        )
            return NextResponse.json({ error: "Not found" }, { status: 404 });

        const searchParams = req.nextUrl.searchParams;

        const parsedSearchParams = companyIdRequiment.safeParse({
            companyIds: searchParams.getAll("companyIds"),
        });

        if (!parsedSearchParams.success)
            return NextResponse.json(
                { error: "Company IDs are required for this query" },
                { status: 400 },
            );

        const companyIds: CompanyId[] = (
            parsedSearchParams.data.companyIds ?? []
        ).filter((cid) => !!cid);

        if (companyIds.length === 0)
            return NextResponse.json(
                { error: "Company IDs are required for this query" },
                { status: 400 },
            );

        let groupingTimezone = accessibleScopeResult.value.orgTimezone;
        if (companyIds.length === 1) {
            const [companyId] = companyIds;
            const foundCompany = accessibleScopeResult.value.companies.find(
                (c) => c.id === companyId,
            );

            if (foundCompany) groupingTimezone = foundCompany.timezone;
        }

        const accessibleCompanyIds = accessibleScopeResult.value.companies.map(
            (c) => c.id,
        );

        for (const id of companyIds) {
            if (!accessibleCompanyIds.includes(id))
                return NextResponse.json(
                    { error: "Not found" },
                    { status: 401 },
                );
        }

        return handler(req, {
            session,
            organizationId,
            companyIds,
            groupingTimezone,
        });
    };
}
