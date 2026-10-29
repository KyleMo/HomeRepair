import { Prisma, prisma } from "@homerepair/data";
import { NextRequest, NextResponse } from "next/server";

/** Branding changes rarely, so every embed load shouldn't cost a query. */
const CACHE_SECONDS = 60;

export const GET = async (
    _request: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            companyId: string;
        }>;
    },
) => {
    try {
        const { companyId } = await params;
        const queryParams = _request.nextUrl.searchParams;
        const applianceIds = queryParams.getAll("applianceId");
        const brandIds = queryParams.getAll("brandIds");

        if (!companyId)
            return NextResponse.json(
                { error: "Company ID is required" },
                { status: 400 },
            );

        let symptomWhere: Prisma.SymptomWhereInput = {
            AND: [
                {
                    OR: [
                        {
                            // default symptom
                            company_id: null,
                        },
                        {
                            // company specific symptoms
                            company_id: companyId,
                        },
                    ],
                },
                {
                    // no rule means enabled, so only exclude an explicit Disabled
                    symptom_rules: {
                        none: {
                            company_id: companyId,
                            rule: "Disabled",
                        },
                    },
                },
            ],
        };

        if (!!symptomWhere.AND && Array.isArray(symptomWhere.AND)) {
            if (!!applianceIds && applianceIds.length > 0) {
                symptomWhere.AND.push({
                    appliance_type_id: {
                        in: applianceIds,
                    },
                });
            }
            if (!!brandIds && brandIds.length > 0)
                symptomWhere.AND.push({
                    brand_id: {
                        in: brandIds,
                    },
                });
        }

        const symptoms = await prisma.symptom.findMany({
            where: symptomWhere,
            select: {
                id: true,
                name: true,
                description: true,
            },
        });

        return NextResponse.json(symptoms, {
            headers: {
                "Cache-Control": `public, s-maxage=${CACHE_SECONDS}`,
            },
        });
    } catch (error) {
        console.error("[GET portal branding]", error);
        return NextResponse.json(
            { error: "Failed to load settings" },
            { status: 500 },
        );
    }
};
