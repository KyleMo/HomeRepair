import { withOrgAccess } from "@/lib/api";
import { getBookings } from "@/lib/db/bookings";
import { queryParamterAccumulater } from "@/lib/db/get";
import { BOOKING_STATUSES, bookingQuerySchema } from "@/types/booking";
import type { BookingStatus } from "@homerepair/data/types";
import { groupBookingsByDate } from "@homerepair/utility";
import { NextResponse } from "next/server";

export const GET = withOrgAccess(
    async (_request, { companyIds, groupingTimezone }) => {
        try {
            const result = bookingQuerySchema.safeParse(
                queryParamterAccumulater(
                    _request.nextUrl.searchParams.entries(),
                ),
            );

            if (!result.success)
                return NextResponse.json(
                    { error: result.error.message },
                    { status: 400 },
                );

            const bookings = await getBookings({ ...result.data, companyIds });
            const days = groupBookingsByDate(bookings, groupingTimezone);

            return NextResponse.json({
                timezone: groupingTimezone,
                days,
            });
        } catch (error) {
            return NextResponse.json(
                { error },
                {
                    status: 500,
                },
            );
        }
    },
);
