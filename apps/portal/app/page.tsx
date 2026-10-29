import PortalBase from "@/components/layout/PortalBase";
import PortalClient from "@/components/layout/PortalClient";
import PortalUnavailable from "@/components/layout/PortalUnavailable";
import { PortalService } from "@/models/Settings";
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
            company_services: {
                select: {
                    id: true,
                    appliance_type: {
                        select: {
                            id: true,
                            name: true,
                            symptoms: {
                                where: {
                                    // defaults + this company's custom ones
                                    OR: [
                                        { company_id: null },
                                        { company_id: clientId },
                                    ],
                                    // no rule means enabled, so only exclude an explicit Disabled
                                    symptom_rules: {
                                        none: {
                                            company_id: clientId,
                                            rule: "Disabled",
                                        },
                                    },
                                },
                                select: {
                                    id: true,
                                    name: true,
                                    description: true,
                                    brand_id: true,
                                    appliance_type_id: true,
                                },
                            },
                        },
                    },
                    duration_overrides: {
                        select: {
                            duration_minutes: true,
                            company_service_id: true,
                            brand_id: true,
                            symptom_id: true,
                        },
                    },
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
            <PortalClient
                clientId={clientId}
                services={company.company_services as PortalService[]}
            />
        </PortalBase>
    );
}
