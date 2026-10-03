import PortalBase from "@/components/layout/PortalBase";
import PortalClient from "@/components/layout/PortalClient";
import PortalUnavailable from "@/components/layout/PortalUnavailable";
import { DEFAULT_COMPANY_BRANDING, prisma } from "@homerepair/data";

export default async function PortalPage({
    searchParams,
}: {
    searchParams: Promise<{ clientId?: string | string[] }>;
}) {
    const clientId = (await searchParams).clientId;

    if (!clientId || Array.isArray(clientId))
        return (
            <PortalBase>
                <PortalUnavailable error="Failed to get client ID" />
            </PortalBase>
        );

    const company = await prisma.company.findUnique({
        where: { id: clientId },
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

    if (!company) {
        return (
            <PortalBase>
                <PortalUnavailable error="Unable to find company" />
            </PortalBase>
        );
    }

    return (
        <PortalBase
            brandSettings={{
                company_name: company.name,
                ...(company.brand_setting ?? DEFAULT_COMPANY_BRANDING),
            }}
        >
            <PortalClient clientId={clientId} />
        </PortalBase>
    );
}
