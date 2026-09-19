// Types-only entry: this module is imported by client components, so it may
// only import *types* from "@homerepair/data" — the root export pulls in
// server-only plus the Prisma runtime.
import type { Font, Weekday } from "@homerepair/data/types";
import { normalizeHex } from "@homerepair/utility";
import z from "zod";

/**
 * Prisma enums reach the client as types only (`export type *`), so the values
 * are restated here and checked against the enum with `satisfies`. Adding a
 * member to the schema without adding it here is a compile error.
 */
export const WEEKDAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
] as const satisfies readonly Weekday[];

export const FONTS = ["Poppins"] as const satisfies readonly Font[];

/** Shared by the console's inputs and the API's validation, so they can't drift. */
export const MIN_CORNER_RADIUS = 0;
export const MAX_CORNER_RADIUS = 24;
export const MIN_JOBS_PER_WINDOW = 1;
export const MAX_JOBS_PER_WINDOW = 10;
/** Window lengths the booking flow can slice a day into, in minutes. */
export const WINDOW_LENGTHS_MINUTES = [120, 180, 240] as const;

/**
 * Defaults mirroring the schema's, used in two places: filling a response for a
 * company whose settings row hasn't been created yet, and as the create half of
 * the upsert when that company is first saved. Keep in step with schema.prisma.
 */
export const DEFAULT_BRAND_SETTINGS = {
    primary_color: "#0F6E56",
    secondary_color: "#E1F5EE",
    selected_fill: "#E1F5EE",
    selected_text: "#085041",
    body_text: "#000000",
    button_text: "#FFFFFF",
    page_background: "#F5F7F6",
    corner_radius: 12,
    font: "Poppins" as Font,
    logo_url: null,
} as const;

export const DEFAULT_BOOKING_SETTINGS = {
    default_window_length_minutes: 120,
    allowed_jobs_per_window: 3,
} as const;

export const DEFAULT_DAY_SETTINGS = {
    is_open: true,
    open_at: "09:00",
    close_at: "17:00",
} as const;

/* ------------------------------------------------------------------ *
 * Response — GET /api/company/[companyId]/setting
 * ------------------------------------------------------------------ */

export type BrandSettings = {
    primary_color: string;
    secondary_color: string;
    selected_fill: string;
    selected_text: string;
    body_text: string;
    button_text: string;
    page_background: string;
    corner_radius: number;
    font: Font;
    logo_url: string | null;
};

/** One row per weekday, always all seven, ordered Sunday first. */
export type DaySettings = {
    week_day: Weekday;
    is_open: boolean;
    /** 24h "HH:mm" wall-clock in the company's timezone. */
    open_at: string;
    close_at: string;
};

export type HoursSettings = {
    default_window_length_minutes: number;
    allowed_jobs_per_window: number;
    days: DaySettings[];
};

export type CompanyIdentity = {
    id: string;
    slug: string;
    name: string;
    phone: string | null;
    /** IANA identifier — the zone `open_at`/`close_at` are read in. */
    timezone: string;
};

export type CompanySettings = {
    company: CompanyIdentity;
    brand: BrandSettings;
    hours: HoursSettings;
};

/* ------------------------------------------------------------------ *
 * Request — PATCH /api/company/[companyId]/setting
 * ------------------------------------------------------------------ */

/**
 * Accepts what someone actually typed (`0f6e56`, `#0F6`) and stores the
 * canonical `#RRGGBB`, so the column only ever holds one spelling of a colour.
 */
const hexColor = z
    .string()
    .refine((value) => normalizeHex(value) !== null, {
        message: "Must be a hex colour, e.g. #0F6E56",
    })
    // The refine above already proved this parses; `?? value` is only here to
    // keep the output typed `string` rather than `string | null`.
    .transform((value) => normalizeHex(value) ?? value);

/** 24h "HH:mm" — the shape open_at/close_at are stored as (VarChar(5)). */
const clockTime = z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Must be a 24h time, e.g. 09:00");

const brandPatchSchema = z
    .object({
        primary_color: hexColor,
        secondary_color: hexColor,
        selected_fill: hexColor,
        selected_text: hexColor,
        body_text: hexColor,
        button_text: hexColor,
        page_background: hexColor,
        corner_radius: z
            .number()
            .int()
            .min(MIN_CORNER_RADIUS)
            .max(MAX_CORNER_RADIUS),
        font: z.enum(FONTS),
        logo_url: z.url().nullable(),
    })
    .partial();

const dayPatchSchema = z
    .object({
        week_day: z.enum(WEEKDAYS),
        is_open: z.boolean(),
        open_at: clockTime,
        close_at: clockTime,
    })
    .refine((day) => !day.is_open || day.open_at < day.close_at, {
        message: "An open day must close after it opens",
        path: ["close_at"],
    });

const hoursPatchSchema = z
    .object({
        // Arrival windows tile the day from opening time, so a length that
        // isn't a whole number of half-hours leaves them straddling the slots
        // the pickers offer.
        default_window_length_minutes: z
            .number()
            .int()
            .min(30)
            .max(480)
            .refine((minutes) => minutes % 30 === 0, {
                message: "Window length must be a multiple of 30 minutes",
            }),
        allowed_jobs_per_window: z
            .number()
            .int()
            .min(MIN_JOBS_PER_WINDOW)
            .max(MAX_JOBS_PER_WINDOW),
        /** Sparse: only the days present are written, the rest are untouched. */
        days: z
            .array(dayPatchSchema)
            .max(WEEKDAYS.length)
            .refine(
                (days) =>
                    new Set(days.map((day) => day.week_day)).size ===
                    days.length,
                { message: "Each weekday may only appear once" },
            ),
    })
    .partial();

const companyPatchSchema = z
    .object({
        name: z.string().trim().min(1).max(120),
        // An emptied field means "no phone", which is what the column stores.
        phone: z
            .string()
            .trim()
            .max(32)
            .nullable()
            .transform((phone) => phone || null),
        timezone: z
            .string()
            .refine((zone) => Intl.supportedValuesOf("timeZone").includes(zone), {
                message: "Must be an IANA timezone, e.g. America/Los_Angeles",
            }),
    })
    .partial();

/**
 * Every section is optional, so a tab can save just what it owns. An empty
 * object is rejected rather than silently doing nothing.
 */
export const settingsPatchSchema = z
    .object({
        company: companyPatchSchema,
        brand: brandPatchSchema,
        hours: hoursPatchSchema,
    })
    .partial()
    .refine((patch) => Object.values(patch).some((section) => !!section), {
        message: "Nothing to update",
    });

export type SettingsPatch = z.infer<typeof settingsPatchSchema>;
