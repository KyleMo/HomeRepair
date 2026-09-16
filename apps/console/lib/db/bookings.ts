import { bookingQuerySchema } from "@/types/booking";
import { CompanyId } from "@/types/organization";
import { Prisma, prisma } from "@homerepair/data";
import z from "zod";
import dayts from "../dayjs";

const MAX_BOOKINGS = 200;

export type GetCompanyBookingsArgs = z.infer<typeof bookingQuerySchema> & {
    companyIds?: CompanyId[];
};

export const getBookings = async ({
    companyIds,
    from,
    to,
    status,
    limit = MAX_BOOKINGS,
}: GetCompanyBookingsArgs) => {
    const where: Prisma.CompanyBookingWhereInput = {
        company_id: {
            in: companyIds,
        },
    };

    if (from)
        where.start_time = { gte: dayts(from).startOf("day").toISOString() };
    if (to) where.start_time = { lte: dayts(to).endOf("day").toISOString() };
    if (status && Array.isArray(status) && status.length > 0)
        where.status = { in: status };
    else if (status && typeof status === "string")
        where.status = { in: [status] };

    return prisma.companyBooking.findMany({
        where,
        orderBy: { start_time: "asc" },
        take: Math.min(limit, MAX_BOOKINGS),
        include: {
            customer: {
                select: { first_name: true, last_name: true, phone: true },
            },
            company_service: {
                select: { appliance_type: { select: { name: true } } },
            },
            appliance_brand: { select: { name: true } },
            booking_symptoms: {
                select: { symptom: { select: { name: true } } },
            },
        },
    });
};
