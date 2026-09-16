// Types-only entry: this module is imported by client components, and the root
// "@homerepair/data" export pulls in server-only plus the Prisma runtime.
import type { getBookings } from "@/lib/db/bookings";
import type { BookingStatus, Prisma } from "@homerepair/data/types";
import type { BookingDay } from "@homerepair/utility/client";
import z from "zod";

export const BOOKING_STATUSES = [
    "Scheduled",
    "InProgress",
    "Completed",
    "Cancelled",
] as const satisfies readonly BookingStatus[];

export const bookingQuerySchema = z.object({
    from: z.coerce.date().nullish(),
    to: z.coerce.date().nullish(),
    status: z
        .enum(BOOKING_STATUSES)
        .or(z.array(z.enum(BOOKING_STATUSES)).nullish()),
    limit: z.coerce.number().int().positive().max(200).optional(),
});

/**
 * What T looks like once it has been through JSON: NextResponse.json calls each
 * value's toJSON, so a Date arrives as an ISO string and a Prisma Decimal
 * (latitude/longitude) as a decimal string. Written once, wrapped around every
 * query's row type — the compiler then points at whatever needs parsing.
 */
export type Serialized<T> = T extends Date | Prisma.Decimal
    ? string
    : T extends (infer U)[]
      ? Serialized<U>[]
      : T extends object
        ? { [K in keyof T]: Serialized<T[K]> }
        : T;

/**
 * GET /api/organization/[organizationId]/booking
 *
 * `timezone` is the zone the days were bucketed against — the single selected
 * company's, or the org's when the view spans several. It travels with the
 * payload because the client can't re-derive it.
 */
export type BookingsResponse = {
    timezone: string;
    days: CompanyBookingDay[];
};

/**
 * One booking as the client sees it — relations and all, read straight off
 * getBookings rather than restated here, so changing that query's `include`
 * updates this for free. One line per query is the whole cost.
 *
 * lib/db/bookings is server-only, but `import type` is erased before bundling,
 * so no Prisma runtime reaches a client component. Keep that import `type`.
 */
export type CompanyBookingSummary = Serialized<
    Awaited<ReturnType<typeof getBookings>>[number]
>;

export type CompanyBookingDay = BookingDay<CompanyBookingSummary>;
