import { Dayjs } from "dayjs";
import dayjs from "../dayjs";
import type {
    Company,
    CompanyBooking,
    CompanyBookingSetting,
    DayOfWeekSetting,
    Weekday,
} from "@homerepair/data";
import { IsoString, JobWindow } from "../../types";

type Greeting = "Good Morning" | "Good Afternoon" | "Good Evening";

export const greetingByTimeOfDay = (): Greeting => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
};

export type DayOfWeek = {
    index: number;
    label: Weekday;
    labelShort: string;
};

// Ordered so each entry's position matches its index (dayjs().day()).
// Labels are checked against the Weekday enum via the DayOfWeek type.
export const daysOfWeek: DayOfWeek[] = [
    { index: 0, label: "Sunday", labelShort: "Sun" },
    { index: 1, label: "Monday", labelShort: "Mon" },
    { index: 2, label: "Tuesday", labelShort: "Tue" },
    { index: 3, label: "Wednesday", labelShort: "Wed" },
    { index: 4, label: "Thursday", labelShort: "Thu" },
    { index: 5, label: "Friday", labelShort: "Fri" },
    { index: 6, label: "Saturday", labelShort: "Sat" },
];

export const getDayOfWeekByWeekday = (dow: Weekday): DayOfWeek => {
    const day = daysOfWeek.find((d) => d.label === dow);
    if (!day) throw new Error(`Invalid day of week ${dow}`);
    return day;
};

export const getDayOfWeekByInt = (dow: number): DayOfWeek => {
    const day = daysOfWeek[dow];
    if (!day) throw new Error(`Invalid day of week ${dow}`);
    return day;
};

/**
 * "2026-08-11" -> "Tue Aug 11".
 *
 * Parsed field-by-field on purpose. `new Date("2026-08-11")` treats a date-only
 * string as UTC midnight, which formats as the *previous* day for any viewer
 * west of Greenwich — the whole list would be off by one every afternoon in
 * Portland. Passing the parts to the constructor builds local midnight instead.
 */
export const formatBookingDate = (isoDate: string): string => {
    // Fixed-width YYYY-MM-DD, so slice rather than destructure a split: under
    // noUncheckedIndexedAccess the latter is `number | undefined` and the only
    // way through is a fallback that would quietly format the wrong day.
    const year = Number(isoDate.slice(0, 4));
    const month = Number(isoDate.slice(5, 7));
    const day = Number(isoDate.slice(8, 10));

    return new Date(year, month - 1, day)
        .toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        })
        .replace(",", "");
};

/** "08:00" -> { hour: 8, minute: 0 }. Assumes fixed-width 24h HH:mm. */
const parseClockTime = (time: string) => ({
    hour: Number(time.slice(0, 2)),
    minute: Number(time.slice(3, 5)),
});

const meridiem = (hour: number): "AM" | "PM" => (hour < 12 ? "AM" : "PM");

/** 0 -> 12, 13 -> 1. Drops ":00" so whole hours read as "8" not "8:00". */
const clockLabel = ({ hour, minute }: { hour: number; minute: number }) => {
    const twelveHour = hour % 12 === 0 ? 12 : hour % 12;
    return minute === 0
        ? `${twelveHour}`
        : `${twelveHour}:${String(minute).padStart(2, "0")}`;
};

export const formatJobTimeInterval = (
    start: Dayjs,
    end: Dayjs,
    timezone: string,
) => {
    const convertedStart = start.tz(timezone);
    const convertedEnd = end.tz(timezone);
    return `${formatDateToTimeString(convertedStart)} - ${formatDateToTimeString(convertedEnd)}`;
};

export const formatDateToTimeString = (date: Dayjs): string => {
    let dateString = date.format("h A");
    if (date.minute() > 0) dateString = date.format("h:mm A");
    return dateString;
};

export const timezoneAbbreviation = (
    timezone: string,
    on: Date = new Date(),
): string => {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        timeZoneName: "short",
    }).formatToParts(on);

    return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
};

/** ["00:00", "00:30", … "23:30"] — canonical values for open/close pickers. */
export const buildTimeSlots = (stepMinutes = 30): string[] => {
    const slots: string[] = [];
    for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
        const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
        const minute = String(minutes % 60).padStart(2, "0");
        slots.push(`${hour}:${minute}`);
    }
    return slots;
};

/** "09:30" -> "9:30 AM". The single-time counterpart to formatTimeRange. */
export const formatClockTime = (time: string): string =>
    `${clockLabel(parseClockTime(time))} ${meridiem(parseClockTime(time).hour)}`;

/**
 * The calendar date an instant falls on *as seen from `timezone`*, "YYYY-MM-DD".
 *
 * A Date is just an instant, so it can't be "converted" to a zone — the zone
 * only decides how that instant reads. 2026-08-12T02:00Z is Aug 12 in UTC but
 * Aug 11 in America/Los_Angeles, which is exactly the disagreement grouping has
 * to resolve. en-CA formats as ISO, so the key is the "YYYY-MM-DD" that
 * formatBookingDate already takes. Intl handles the DST offset for the date in
 * question, which hand-rolled offset arithmetic gets wrong twice a year.
 */
export const bookingDateKey = (date: Date, timezone: string): string => {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
};

export type BookingDay<T> = {
    /** "YYYY-MM-DD" in the grouping timezone — not an instant. */
    date: string;
    bookings: T[];
};

/**
 * Buckets bookings into calendar days, all measured against one timezone.
 *
 * Days come back chronologically; the order within a day is whatever the caller
 * passed in (getBookings already sorts by start_time). The bookings themselves
 * are untouched — start_time stays the true instant, so formatting, sorting and
 * range filters all keep working downstream.
 */
export const groupBookingsByDate = <T extends { start_time: Date | string }>(
    bookings: T[],
    timezone: string,
): BookingDay<T>[] => {
    const byDate = new Map<string, T[]>();

    for (const booking of bookings) {
        // Date over the wire is an ISO string, but a Date server-side.
        const key = bookingDateKey(new Date(booking.start_time), timezone);
        const bucket = byDate.get(key);
        if (bucket) bucket.push(booking);
        else byDate.set(key, [booking]);
    }

    // ISO keys sort lexicographically, so no date parsing needed to order days.
    return [...byDate]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, dayBookings]) => ({ date, bookings: dayBookings }));
};

// Only the fields availability reads, so callers can pass a narrow `select`.
type AvailabilityBooking = Pick<CompanyBooking, "start_time" | "end_time">;
type AvailabilityDaySetting = Pick<
    DayOfWeekSetting,
    "week_day" | "is_open" | "open_at" | "close_at"
>;

const toJobWindows = (bookings: AvailabilityBooking[]): JobWindow[] => {
    return bookings.map((b) => ({
        start: b.start_time.toISOString(),
        end: b.end_time.toISOString(),
    }));
};

const buildOpenWindows = ({
    from,
    to,
    jobWindows,
    maxAllowedJobsPerWindow,
}: {
    from: Dayjs; // company open, already .tz()'d
    to: Dayjs; // company close
    jobWindows: JobWindow[];
    maxAllowedJobsPerWindow: number;
}): { start: Dayjs; end: Dayjs }[] => {
    const events = jobWindows
        .flatMap((jw) => [
            { at: dayjs(jw.start).valueOf(), delta: 1 },
            { at: dayjs(jw.end).valueOf(), delta: -1 },
        ])
        // sort so ends are first in the array
        .sort((a, b) => a.at - b.at || a.delta - b.delta);

    const windows: { start: number; end: number }[] = [];

    let load = 0;
    let openSince: number | null = -Infinity;

    for (const { at, delta } of events) {
        const wasOpen = load < maxAllowedJobsPerWindow;
        load += delta;
        const isOpen = load < maxAllowedJobsPerWindow;

        // Since we were previously open and we are now not open, we know that we have found the end of a window
        if (wasOpen && !isOpen) {
            windows.push({ start: openSince!, end: at });
            openSince = null;
        } else if (!wasOpen && isOpen) {
            openSince = at;
        }
        // else move on to the next event
    }
    if (openSince !== null) windows.push({ start: openSince, end: Infinity });

    const fromMs = from.valueOf();
    const toMs = to.valueOf();
    return (
        windows
            .map((w) => ({
                start: Math.max(w.start, fromMs),
                end: Math.min(w.end, toMs),
            }))
            // remove empty windows from above min/max
            .filter((w) => w.start < w.end)
            // add() off `from` keeps its timezone, unlike dayjs(ms)
            .map((w) => ({
                start: from.add(w.start - fromMs, "millisecond"),
                end: from.add(w.end - fromMs, "millisecond"),
            }))
    );
};

type OpenTimeWindow = {
    start: IsoString;
    end: IsoString;
};

type AvailabilityResult = {
    date: IsoString;
    openTimeWindows: OpenTimeWindow[];
};

export const buildAvailabilityForDay = (
    /**Earliest bookable instant: now for today, company-local midnight for a future day*/
    start: Dayjs,
    company: Pick<Company, "timezone">,
    maxAllowedJobsPerWindow: number,
    daysOfWeekSettings: AvailabilityDaySetting[],
    // Excludes cancelled bookings
    bookings: AvailabilityBooking[],
): AvailabilityResult => {
    // This doesn't actually change the time, it just assigns a timezone
    const localStart = start.tz(company.timezone);
    // company open hours are from/to
    const dayOfWeek = daysOfWeekSettings.find(
        (dow) => dow.week_day === getDayOfWeekByInt(localStart.day()).label,
    );

    // Assume closed
    if (!dayOfWeek || !dayOfWeek.is_open)
        return {
            date: localStart.startOf("day").toISOString(),
            openTimeWindows: [],
        };

    // Plain "YYYY-MM-DD HH:mm" string, read as company clock time (not converted)
    const localOpenAt = dayjs.tz(
        `${localStart.format("YYYY-MM-DD")} ${dayOfWeek.open_at}`,
        company.timezone,
    );
    const localCloseAt = dayjs.tz(
        `${localStart.format("YYYY-MM-DD")} ${dayOfWeek.close_at}`,
        company.timezone,
    );

    const ceilingLocal = ceilToQuarterHour(localStart);
    const openWindows = buildOpenWindows({
        from: ceilingLocal > localOpenAt ? ceilingLocal : localOpenAt,
        to: localCloseAt,
        jobWindows: toJobWindows(bookings),
        maxAllowedJobsPerWindow,
    });

    return {
        date: localStart.startOf("day").toISOString(),
        openTimeWindows: openWindows.map((ow) => {
            return {
                start: ow.start.toISOString(),
                end: ow.end.toISOString(),
            };
        }),
    };
};

// 1:05 -> 1:15, 1:15 -> 1:15, 1:15:30 -> 1:30
export const ceilToQuarterHour = (time: Dayjs): Dayjs => {
    const floored = time
        .minute(time.minute() - (time.minute() % 15))
        .second(0)
        .millisecond(0);
    return floored.isBefore(time) ? floored.add(15, "minute") : floored;
};
