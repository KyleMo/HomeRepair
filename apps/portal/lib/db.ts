import { PortalService } from "@/models/Settings";
import { prisma } from "@homerepair/data";

/// If a company service row doesn't exist, then a company doesn't offer that service
export const getCompanyServices = async (clientId: string) => {
    return await prisma.companyService.findMany({
        where: {
            enabled: true,
            company_id: clientId,
        },
    });
};
