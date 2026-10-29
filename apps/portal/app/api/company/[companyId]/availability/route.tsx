import { prisma } from "@homerepair/data";
import {
    buildAvailabilityForDay,
    ceilToQuarterHour,
    dayjs,
    type Dayjs,
} from "@homerepair/utility";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const SLOT_STEP_MINUTES = 15;

const availabilityInputRequest = z.object({
    from: z.iso.datetime(),
    repairs: z.array(
        z.object({
            companyServiceId: z.string(),
            brandId: z.string().nullable(),
            symptomId: z.string().nullable(),
        }),
    ),
});

type DurationOverride = {
    duration_minutes: number;
    brand_id: string | null;
    symptom_id: string | null;
};

/**
 * Most specific override wins:
 *   brand + symptom  >  symptom only  >  brand only  >  appliance default
 *
 * With several symptoms, each resolves on its own and the longest wins — the
 * visit has to cover the slowest problem.
 */
const resolveRepairDuration = (
    defaultMinutes: number,
    overrides: DurationOverride[],
    brandId: string | null,
    symptomIds: string[],
): number => {
    const brandOnly = brandId
        ? overrides.find((o) => o.brand_id === brandId && o.symptom_id === null)
        : undefined;

    if (symptomIds.length === 0)
        return brandOnly?.duration_minutes ?? defaultMinutes;

    const perSymptom = symptomIds.map((symptomId) => {
        const match =
            (brandId
                ? overrides.find(
                      (o) =>
                          o.brand_id === brandId && o.symptom_id === symptomId,
                  )
                : undefined) ??
            overrides.find(
                (o) => o.brand_id === null && o.symptom_id === symptomId,
            ) ??
            brandOnly;
        return match?.duration_minutes ?? defaultMinutes;
    });

    return Math.max(...perSymptom);
};

export const POST = async (
    _request: NextRequest,
    { params }: { params: Promise<{ companyId: string }> },
) => {
    try {
        const companyId = (await params).companyId;
        const { from, repairs } = availabilityInputRequest.parse(
            await _request.json(),
        );

        if (!companyId)
            return NextResponse.json(
                { error: "Company ID is required" },
                { status: 400 },
            );

        if (repairs.length === 0) {
            return NextResponse.json(
                { error: "At least one repair is required" },
                { status: 400 },
            );
        }

        // default to search for availabilty starting now if from not defined
        let fromDate: Dayjs | null = null;

        try {
            if (from) fromDate = dayjs(from);
            // else now
            else fromDate = dayjs();
        } catch (error) {
            fromDate = dayjs();
        }

        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: {
                name: true,
                timezone: true,
                company_services: {
                    where: {
                        enabled: true,
                    },
                    select: {
                        id: true,
                        duration_overrides: true,
                        appliance_type: {
                            select: {
                                default_job_duration_minutes: true,
                            },
                        },
                    },
                },
                booking_setting: {
                    select: {
                        days_of_the_week: true,
                        allowed_jobs_per_window: true,
                    },
                },
                // all booking in timezone to consider
                bookings: {
                    where: {
                        AND: [
                            {
                                // Jobs that start after or end after from value
                                OR: [
                                    {
                                        start_time: {
                                            gte: fromDate.toISOString(),
                                        },
                                    },
                                    {
                                        end_time: {
                                            gte: fromDate.toISOString(),
                                        },
                                    },
                                ],
                                status: {
                                    not: "Cancelled",
                                },
                            },
                        ],
                    },
                },
            },
        });

        if (!company || !company.booking_setting)
            return NextResponse.json({ error: "Not found" }, { status: 404 });

        const localStart = dayjs.tz(fromDate, company.timezone);
        const availability = buildAvailabilityForDay(
            localStart,
            company,
            company.booking_setting.allowed_jobs_per_window,
            company.booking_setting?.days_of_the_week ?? [],
            company.bookings,
        );

        console.log(availability);

        // if no availability return nothing
        if (availability.openTimeWindows.length === 0)
            return NextResponse.json({
                date: availability.date,
                timezone: company.timezone,
                durationMinutes: 0,
                startTimes: [],
            });

        // Loop the requested repairs so two of the same
        // appliance count twice. One visit, so durations add up.
        let totalMinutes = 0;
        for (const repair of repairs) {
            const service = company.company_services.find(
                (cs) => cs.id === repair.companyServiceId,
            );
            if (!service)
                return NextResponse.json(
                    {
                        error: `Service ${repair.companyServiceId} is not offered`,
                    },
                    { status: 400 },
                );

            totalMinutes += resolveRepairDuration(
                service.appliance_type.default_job_duration_minutes,
                service.duration_overrides,
                repair.brandId,
                repair.symptomId ? [repair.symptomId] : [],
            );
        }

        const startTimes = availability.openTimeWindows.flatMap((tw) => {
            const windowEnd = dayjs(tw.end);
            const starts: string[] = [];
            let t = ceilToQuarterHour(dayjs(tw.start).tz(company.timezone));

            while (!t.add(totalMinutes, "minutes").isAfter(windowEnd)) {
                starts.push(t.toISOString());
                t = t.add(SLOT_STEP_MINUTES, "minutes");
            }

            return starts;
        });

        return NextResponse.json({
            date: availability.date,
            // so the client renders times as the company's wall clock
            timezone: company.timezone,
            durationMinutes: totalMinutes,
            startTimes,
        });
    } catch (error) {
        // Bad input is the client's fault, not ours — answer 400, don't log.
        if (error instanceof z.ZodError)
            return NextResponse.json(
                { error: "Invalid request", issues: error.issues },
                { status: 400 },
            );
        // request.json() throws SyntaxError on a malformed body.
        if (error instanceof SyntaxError)
            return NextResponse.json(
                { error: "Request body must be valid JSON" },
                { status: 400 },
            );

        console.error("[POST availability]", error);
        return NextResponse.json(
            { error: "Failed to load availability" },
            { status: 500 },
        );
    }
};
