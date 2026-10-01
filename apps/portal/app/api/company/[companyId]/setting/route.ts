import { PortalBrandConfig } from "@/models/BrandSettings";
import { prisma } from "@homerepair/data";
import { DEFAULT_COMPANY_BRANDING } from "@homerepair/data/types";
import { NextRequest, NextResponse } from "next/server";

/** Branding changes rarely, so every embed load shouldn't cost a query. */
const CACHE_SECONDS = 60;

/**
 * GET /api/company/[companyId]/setting
 *
 * The branding the embedded portal paints itself with. Public and
 * unauthenticated by necessity — the id comes from the snippet on the
 * customer's own website — so this returns only what the portal renders, and
 * nothing that identifies the company's account beyond its public name.
 */
export const GET = async (
    _request: NextRequest,
    { params }: { params: Promise<{ companyId: string }> },
) => {
    try {
        const { companyId } = await params;

        if (!companyId)
            return NextResponse.json(
                { error: "Company ID is required" },
                { status: 400 },
            );

        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: {
                name: true,
                brand_setting: {
                    select: {
                        primary_color: true,
                        secondary_color: true,
                        selected_fill: true,
                        selected_text: true,
                        body_text: true,
                        button_text: true,
                        page_background: true,
                        corner_radius: true,
                        font: true,
                        logo_url: true,
                    },
                },
            },
        });

        if (!company)
            return NextResponse.json({ error: "Not found" }, { status: 404 });

        const brand: PortalBrandConfig = {
            company_name: company.name,
            ...(company.brand_setting ?? DEFAULT_COMPANY_BRANDING),
        };

        return NextResponse.json(brand, {
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
