import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { BookingStatus, PrismaClient } from "./generated/client/index.js";
import { slugify } from "@homerepair/utility";
import bcrypt from "bcryptjs";

const envConnectionString = process.env.DATABASE_URL;
if (!envConnectionString) {
    throw new Error(
        "DATABASE_URL is not set. Check packages/data/.env and run with cwd = packages/data.",
    );
}
// Re-bound as a plain string: the narrowing above doesn't survive into the
// function bodies below, and the alternative is a `!` at every use site.
const connectionString: string = envConnectionString;

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
});

const DEV_PASSWORD_HASH = await bcrypt.hash("password", 10);

/**
 * Hosts this seed is allowed to wipe. Everything below deletes the entire
 * database, and the only thing standing between that and someone's staging box
 * is whichever DATABASE_URL happens to be in packages/data/.env at the time.
 * Set ALLOW_DESTRUCTIVE_SEED=true to override deliberately.
 */
const LOCAL_HOSTS = ["localhost", "127.0.0.1", "::1"];

const assertLocalDatabase = (url: string) => {
    if (process.env.ALLOW_DESTRUCTIVE_SEED === "true") return;

    const { hostname } = new URL(url);
    if (LOCAL_HOSTS.includes(hostname)) return;

    throw new Error(
        `Refusing to wipe a non-local database (host: ${hostname}). This seed ` +
            `truncates every table. Set ALLOW_DESTRUCTIVE_SEED=true if you ` +
            `really mean it.`,
    );
};

/**
 * Empties every table so the seed can be re-run to refresh the demo data.
 *
 * The table list is read from the database rather than hardcoded, so adding a
 * model to the schema doesn't quietly leave a table behind to collide with the
 * next run's fixed ids. TRUNCATE ... CASCADE means foreign keys don't dictate a
 * delete order, and RESTART IDENTITY resets sequences so re-seeded rows don't
 * drift upward in id each time.
 */
const resetDatabase = async () => {
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename <> '_prisma_migrations'
    `;

    // Nothing to truncate before the first migration has been applied.
    if (tables.length === 0) return;

    const quoted = tables
        .map(({ tablename }) => `"public"."${tablename}"`)
        .join(", ");

    await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`,
    );

    console.log(`Cleared ${tables.length} tables.`);
};

const BOOKED_TZ = "America/Los_Angeles";

const seedDate = (dayOffset: number): string => {
    // en-CA formats as ISO, the same "YYYY-MM-DD" shape bookingDateKey produces.
    const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: BOOKED_TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());

    // Step the day in UTC. Local-time arithmetic on a DST boundary can land on
    // the same date twice or skip one; UTC days are always exactly 24 hours.
    const day = new Date(`${today}T00:00:00Z`);
    day.setUTCDate(day.getUTCDate() + dayOffset);
    return day.toISOString().slice(0, 10);
};

/** BOOKED_TZ's UTC offset at `instant`, as "-08:00" / "-07:00". */
const zoneOffset = (instant: Date): string => {
    const name = new Intl.DateTimeFormat("en-US", {
        timeZone: BOOKED_TZ,
        timeZoneName: "longOffset",
    })
        .formatToParts(instant)
        .find((part) => part.type === "timeZoneName")?.value;

    // "GMT-07:00" -> "-07:00". Bare "GMT" (a zero-offset zone) -> "+00:00".
    return name?.replace("GMT", "") || "+00:00";
};

/**
 * A Pacific wall-clock time on a day relative to today: pacific(-1, "08:00").
 *
 * Returns an instant, which is what the column stores — every DateTime in this
 * schema is UTC, and `booked_timezone` is what turns one back into a clock time.
 * So the offset here isn't stored anywhere; it exists only to say which instant
 * "8 AM in Los Angeles" means. It's looked up for the date in question rather
 * than hardcoded, so a seed run in January means 8 AM PST and one in July means
 * 8 AM PDT — both read back as "8 AM" in the console. Probing at UTC noon puts
 * the lookup after either DST transition (both fire at 2 AM local), which is
 * safe while every seeded time is a business hour.
 */
const pacific = (dayOffset: number, time: string): Date => {
    const date = seedDate(dayOffset);
    const offset = zoneOffset(new Date(`${date}T12:00:00Z`));
    return new Date(`${date}T${time}:00${offset}`);
};

async function seedDev() {
    assertLocalDatabase(connectionString);
    await resetDatabase();

    // --- Organization ---
    const org = await prisma.organization.create({
        data: { id: "kyles_group_1", name: "Kyle's Appliance Group" },
    });

    // --- Company addresses (one per company) ---
    const culverAddress = await prisma.companyAddress.create({
        data: {
            line1: "9500 Culver Blvd",
            line2: "Suite 200",
            city: "Culver City",
            state: "CA",
            postal_code: "90232",
            latitude: 34.021122,
            longitude: -118.396466,
        },
    });
    const santaMonicaAddress = await prisma.companyAddress.create({
        data: {
            line1: "1250 6th St",
            city: "Santa Monica",
            state: "CA",
            postal_code: "90401",
            latitude: 34.019454,
            longitude: -118.491191,
        },
    });

    // --- Companies (both under Kyle's org) ---
    const culverName = "Culver City Appliance Repair";
    const culver = await prisma.company.create({
        data: {
            id: "kyles_company_1",
            name: culverName,
            slug: slugify(culverName), // -> "culver-city-appliance-repair"
            status: "Active",
            organization_id: org.id,
            address_id: culverAddress.id,
        },
    });
    const santaMonicaName = "Santa Monica Appliance Repair";
    const santaMonica = await prisma.company.create({
        data: {
            id: "kyles_company_2",
            name: santaMonicaName,
            slug: slugify(santaMonicaName),
            status: "Trial",
            organization_id: org.id,
            address_id: santaMonicaAddress.id,
        },
    });

    // --- Brand settings (one per company) ---
    // Culver City keeps the palette defaults; only the logo is set, which is
    // the common case and exercises the schema defaults.
    await prisma.companyBrandSetting.create({
        data: {
            company_id: culver.id,
            logo_url: "https://placehold.co/160x48/0F6E56/FFFFFF?text=Culver",
        },
    });
    // Santa Monica overrides everything, so the console has a company whose
    // portal preview looks nothing like the default green.
    await prisma.companyBrandSetting.create({
        data: {
            company_id: santaMonica.id,
            primary_color: "#1D4ED8",
            secondary_color: "#DBEAFE",
            selected_fill: "#DBEAFE",
            selected_text: "#1E3A8A",
            body_text: "#0F172A",
            button_text: "#FFFFFF",
            page_background: "#F8FAFC",
            corner_radius: 4,
            font: "Poppins",
            logo_url: "https://placehold.co/160x48/1D4ED8/FFFFFF?text=SaMo",
        },
    });

    // --- Booking settings + weekly hours (one setting row per company) ---
    const culverBookingSetting = await prisma.companyBookingSetting.create({
        data: {
            company_id: culver.id,
            default_window_length_minutes: 120, // the console's "2 hr" option
            allowed_jobs_per_window: 3,
        },
    });
    const santaMonicaBookingSetting = await prisma.companyBookingSetting.create(
        {
            data: {
                company_id: santaMonica.id,
                default_window_length_minutes: 180, // "3 hr"
                allowed_jobs_per_window: 2,
            },
        },
    );

    // Weekdays 8-5, half day Saturday, closed Sunday. `is_open: false` keeps
    // the configured hours around so toggling a day back on restores them.
    const WEEKLY_HOURS = [
        {
            week_day: "Sunday",
            is_open: false,
            open_at: "09:00",
            close_at: "17:00",
        },
        {
            week_day: "Monday",
            is_open: true,
            open_at: "08:00",
            close_at: "17:00",
        },
        {
            week_day: "Tuesday",
            is_open: true,
            open_at: "08:00",
            close_at: "17:00",
        },
        {
            week_day: "Wednesday",
            is_open: true,
            open_at: "08:00",
            close_at: "17:00",
        },
        {
            week_day: "Thursday",
            is_open: true,
            open_at: "08:00",
            close_at: "17:00",
        },
        {
            week_day: "Friday",
            is_open: true,
            open_at: "08:00",
            close_at: "16:00",
        },
        {
            week_day: "Saturday",
            is_open: true,
            open_at: "09:00",
            close_at: "13:00",
        },
    ] as const;

    await prisma.dayOfWeekSetting.createMany({
        data: WEEKLY_HOURS.map((day) => ({
            ...day,
            company_booking_setting_id: culverBookingSetting.id,
        })),
    });
    // Santa Monica runs a shorter week: closed Sunday and Monday.
    await prisma.dayOfWeekSetting.createMany({
        data: WEEKLY_HOURS.map((day) => ({
            ...day,
            is_open: day.week_day === "Monday" ? false : day.is_open,
            company_booking_setting_id: santaMonicaBookingSetting.id,
        })),
    });

    // --- Users ---
    const kyle = await prisma.user.create({
        data: {
            id: "user_kyle",
            email: "kyle@gmail.com",
            password_hash: DEV_PASSWORD_HASH,
            first_name: "Kyle",
            last_name: "Monstad",
        },
    });
    const maria = await prisma.user.create({
        data: {
            id: "user_maria",
            email: "maria@kylesappliance.com",
            password_hash: DEV_PASSWORD_HASH,
            first_name: "Maria",
            last_name: "Lopez",
        },
    });
    const sam = await prisma.user.create({
        data: {
            id: "user_sam",
            email: "sam@kylesappliance.com",
            password_hash: DEV_PASSWORD_HASH,
            first_name: "Sam",
            last_name: "Park",
        },
    });

    // --- Memberships (covers all three roles + org-wide vs company-scoped) ---
    // Kyle: org-wide Owner -> company_id null grants access to every company.
    await prisma.membership.create({
        data: { role: "Owner", user_id: kyle.id, organization_id: org.id },
    });
    // Maria: Staff scoped to Culver City only.
    await prisma.membership.create({
        data: {
            role: "Staff",
            user_id: maria.id,
            organization_id: org.id,
            company_id: culver.id,
        },
    });
    // Sam: Admin scoped to Santa Monica only.
    await prisma.membership.create({
        data: {
            role: "Admin",
            user_id: sam.id,
            organization_id: org.id,
            company_id: santaMonica.id,
        },
    });

    // --- System appliance types (company_id null = shared defaults) ---
    // Array literal (not .map) so Promise.all infers a tuple and the
    // destructured vars are non-undefined under noUncheckedIndexedAccess.
    const [refrigerator, ovenRange, dishwasher, washer, dryer] =
        await Promise.all([
            prisma.applianceType.create({ data: { name: "Refrigerator" } }),
            prisma.applianceType.create({ data: { name: "Oven / Range" } }),
            prisma.applianceType.create({ data: { name: "Dishwasher" } }),
            prisma.applianceType.create({ data: { name: "Washer" } }),
            prisma.applianceType.create({ data: { name: "Dryer" } }),
        ]);
    // Company-owned appliance type (company_id set).
    const wineCooler = await prisma.applianceType.create({
        data: { name: "Wine Cooler", company_id: culver.id },
    });

    // --- System brands (company_id null); aliases catch duplicate spellings ---
    const [whirlpool, ge, samsung, lg, bosch] = await Promise.all([
        prisma.brand.create({
            data: { name: "Whirlpool", aliases: ["Whirpool"] },
        }),
        prisma.brand.create({
            data: {
                name: "GE",
                aliases: ["General Electric", "GE Appliances"],
            },
        }),
        prisma.brand.create({ data: { name: "Samsung", aliases: [] } }),
        prisma.brand.create({
            data: { name: "LG", aliases: ["LG Electronics"] },
        }),
        prisma.brand.create({ data: { name: "Bosch", aliases: [] } }),
    ]);
    // Company-owned brand (company_id set).
    await prisma.brand.create({
        data: { name: "Sub-Zero", aliases: ["SubZero"], company_id: culver.id },
    });

    // --- System symptoms (company_id null), scoped to an appliance type ---
    const fridgeNotCooling = await prisma.symptom.create({
        data: {
            name: "Not cooling",
            description:
                "The fridge compartment is warm or won't hold temperature.",
            appliance_type_id: refrigerator.id,
        },
    });
    const fridgeLeaking = await prisma.symptom.create({
        data: {
            name: "Leaking water",
            description: "Water pools under or inside the unit.",
            appliance_type_id: refrigerator.id,
        },
    });
    const fridgeIceMaker = await prisma.symptom.create({
        data: {
            name: "Ice maker not working",
            description: "The ice maker produces little or no ice.",
            appliance_type_id: refrigerator.id,
        },
    });
    // Brand-scoped system symptom (brand_id set).
    const samsungIceFrost = await prisma.symptom.create({
        data: {
            name: "Ice maker frost buildup",
            description:
                "Frost accumulates around the ice maker on Samsung models.",
            appliance_type_id: refrigerator.id,
            brand_id: samsung.id,
        },
    });
    const ovenNotHeating = await prisma.symptom.create({
        data: {
            name: "Not heating",
            description: "The oven fails to reach or hold the set temperature.",
            appliance_type_id: ovenRange.id,
        },
    });
    const ovenBurnerIgnite = await prisma.symptom.create({
        data: {
            name: "Burner won't ignite",
            description: "A stovetop burner does not light or spark.",
            appliance_type_id: ovenRange.id,
        },
    });
    const dishwasherNotDraining = await prisma.symptom.create({
        data: {
            name: "Not draining",
            description: "Standing water remains in the tub after a cycle.",
            appliance_type_id: dishwasher.id,
        },
    });
    await prisma.symptom.create({
        data: {
            name: "Dishes not clean",
            description: "Dishes come out dirty, gritty, or filmy.",
            appliance_type_id: dishwasher.id,
        },
    });
    await prisma.symptom.create({
        data: {
            name: "Won't spin",
            description: "The drum does not spin and clothes stay soaked.",
            appliance_type_id: washer.id,
        },
    });
    await prisma.symptom.create({
        data: {
            name: "Not drying",
            description: "The dryer runs but clothes remain damp.",
            appliance_type_id: dryer.id,
        },
    });
    // Company-owned symptom on a company-owned appliance type.
    await prisma.symptom.create({
        data: {
            name: "Compressor noisy",
            description: "The wine cooler compressor rattles or hums loudly.",
            appliance_type_id: wineCooler.id,
            company_id: culver.id,
        },
    });

    // --- Model/serial tag locations (appliance type + optional brand) ---
    await prisma.modelTagLocation.createMany({
        data: [
            { appliance_type_id: refrigerator.id },
            { appliance_type_id: refrigerator.id, brand_id: samsung.id },
            { appliance_type_id: ovenRange.id },
            { appliance_type_id: dishwasher.id },
        ],
    });

    // --- Company services (Culver City offers these; note one is disabled) ---
    const svcRefrigerator = await prisma.companyService.create({
        data: {
            company_id: culver.id,
            appliance_type_id: refrigerator.id,
            job_duration_minutes: 60,
        },
    });
    const svcOvenRange = await prisma.companyService.create({
        data: {
            company_id: culver.id,
            appliance_type_id: ovenRange.id,
            job_duration_minutes: 90,
        },
    });
    const svcDishwasher = await prisma.companyService.create({
        data: {
            company_id: culver.id,
            appliance_type_id: dishwasher.id,
            job_duration_minutes: 45,
        },
    });
    await prisma.companyService.create({
        data: {
            company_id: culver.id,
            appliance_type_id: washer.id,
            job_duration_minutes: 60,
            enabled: false, // currently not taking washer jobs
        },
    });
    await prisma.companyService.create({
        data: {
            company_id: culver.id,
            appliance_type_id: wineCooler.id,
            job_duration_minutes: 75,
        },
    });
    // Santa Monica offers one service so it isn't empty.
    const svcSantaMonicaFridge = await prisma.companyService.create({
        data: {
            company_id: santaMonica.id,
            appliance_type_id: refrigerator.id,
            job_duration_minutes: 55,
        },
    });

    // --- Duration overrides on Culver City's refrigerator service ---
    await prisma.companyServiceDurationOverride.createMany({
        data: [
            // Samsung fridges take longer regardless of symptom.
            {
                company_service_id: svcRefrigerator.id,
                brand_id: samsung.id,
                duration_minutes: 90,
            },
            // Ice-maker jobs take longer regardless of brand.
            {
                company_service_id: svcRefrigerator.id,
                symptom_id: fridgeIceMaker.id,
                duration_minutes: 75,
            },
            // Most specific: a Samsung ice-maker frost job.
            {
                company_service_id: svcRefrigerator.id,
                brand_id: samsung.id,
                symptom_id: samsungIceFrost.id,
                duration_minutes: 110,
            },
        ],
    });

    // --- Company brand rules (covers Allow / Deny / Prefer) ---
    await prisma.companyBrandRule.createMany({
        data: [
            { company_id: culver.id, brand_id: whirlpool.id, rule: "Prefer" },
            { company_id: culver.id, brand_id: bosch.id, rule: "Deny" }, // never service Bosch
            { company_id: culver.id, brand_id: ge.id, rule: "Allow" },
            // Deny Samsung, but only for dishwashers (appliance-type-scoped rule).
            {
                company_id: culver.id,
                brand_id: samsung.id,
                appliance_type_id: dishwasher.id,
                rule: "Deny",
            },
        ],
    });

    // --- Company symptom rules (covers Enabled / Disabled) ---
    await prisma.companySymptomRule.createMany({
        data: [
            // Hide a system symptom for this company.
            {
                company_id: culver.id,
                symptom_id: ovenBurnerIgnite.id,
                rule: "Disabled",
            },
            // Explicitly keep another one on.
            {
                company_id: culver.id,
                symptom_id: fridgeLeaking.id,
                rule: "Enabled",
            },
        ],
    });

    // --- Customers (scoped per company; phone is unique within a company) ---
    const dana = await prisma.customer.create({
        data: {
            company_id: culver.id,
            phone: "+13105550142",
            first_name: "Dana",
            last_name: "Whitfield",
            email: "dana.whitfield@example.com",
        },
    });
    const priya = await prisma.customer.create({
        data: {
            company_id: culver.id,
            phone: "+13105550178",
            first_name: "Priya",
            last_name: "Raman",
        },
    });
    // A property manager — the case `label` / `is_primary` exist for.
    const owen = await prisma.customer.create({
        data: {
            company_id: culver.id,
            phone: "+13105550193",
            first_name: "Owen",
            last_name: "Castellanos",
            email: "owen@westsiderentals.example.com",
        },
    });
    const marguerite = await prisma.customer.create({
        data: {
            company_id: santaMonica.id,
            phone: "+13105550110",
            first_name: "Marguerite",
            last_name: "Doyle",
        },
    });

    // --- Saved customer addresses (editable; bookings snapshot them) ---
    const danaHome = {
        line1: "4218 Vinton Ave",
        city: "Culver City",
        state: "CA",
        postal_code: "90232",
        latitude: 34.019_5,
        longitude: -118.396_1,
    };
    await prisma.customerAddress.create({
        data: { ...danaHome, customer_id: dana.id, is_primary: true },
    });

    const priyaHome = {
        line1: "3711 Huron Ave",
        line2: "Apt 4",
        city: "Culver City",
        state: "CA",
        postal_code: "90232",
        latitude: 34.014_9,
        longitude: -118.389_7,
    };
    await prisma.customerAddress.create({
        data: { ...priyaHome, customer_id: priya.id, is_primary: true },
    });

    // Owen manages three units, so his addresses need labels to tell apart.
    const owenUnitB = {
        line1: "1120 Ocean Park Blvd",
        line2: "Unit 12B",
        city: "Santa Monica",
        state: "CA",
        postal_code: "90405",
        latitude: 34.014_2,
        longitude: -118.480_3,
    };
    await prisma.customerAddress.createMany({
        data: [
            {
                ...owenUnitB,
                label: "Rental — 12B",
                is_primary: true,
                customer_id: owen.id,
            },
            {
                line1: "1120 Ocean Park Blvd",
                line2: "Unit 9A",
                city: "Santa Monica",
                state: "CA",
                postal_code: "90405",
                label: "Rental — 9A",
                customer_id: owen.id,
            },
            {
                line1: "822 Marine St",
                city: "Santa Monica",
                state: "CA",
                postal_code: "90405",
                label: "Rental — Marine St",
                customer_id: owen.id,
            },
        ],
    });

    const margueriteHome = {
        line1: "1546 Euclid St",
        city: "Santa Monica",
        state: "CA",
        postal_code: "90404",
        latitude: 34.026_8,
        longitude: -118.478_9,
    };
    await prisma.customerAddress.create({
        data: {
            ...margueriteHome,
            customer_id: marguerite.id,
            is_primary: true,
        },
    });

    // --- Bookings ---
    // Wall-clock Pacific times anchored to whatever day the seed runs, so the
    // console's "today" and date-grouped views always have something to render
    // no matter how long ago the database was last reset.

    // Yesterday, finished.
    const bookingCompleted = await prisma.companyBooking.create({
        data: {
            company_id: culver.id,
            customer_id: dana.id,
            company_service_id: svcDishwasher.id,
            appliance_brand_id: bosch.id,
            status: BookingStatus.Completed,
            start_time: pacific(-1, "08:36"),
            end_time: pacific(-1, "10:05"),
            completed_at: pacific(-1, "09:35"),
            booked_timezone: BOOKED_TZ,
            ...danaHome,
        },
    });

    // Today, mid-job.
    const bookingInProgress = await prisma.companyBooking.create({
        data: {
            company_id: culver.id,
            customer_id: priya.id,
            company_service_id: svcRefrigerator.id,
            appliance_brand_id: samsung.id,
            status: BookingStatus.InProgress,
            start_time: pacific(0, "11:00"),
            end_time: pacific(0, "13:00"),
            booked_timezone: BOOKED_TZ,
            ...priyaHome,
        },
    });

    // Today, still ahead — no brand, the case a skipped brand step produces.
    const bookingScheduled = await prisma.companyBooking.create({
        data: {
            company_id: culver.id,
            customer_id: owen.id,
            company_service_id: svcOvenRange.id,
            status: BookingStatus.Scheduled,
            start_time: pacific(0, "13:43"),
            end_time: pacific(0, "15:29"),
            booked_timezone: BOOKED_TZ,
            ...owenUnitB,
        },
    });

    // Tomorrow, and a cancellation, so every status appears at least once.
    const bookingTomorrow = await prisma.companyBooking.create({
        data: {
            company_id: culver.id,
            customer_id: dana.id,
            company_service_id: svcRefrigerator.id,
            appliance_brand_id: whirlpool.id,
            status: BookingStatus.Scheduled,
            start_time: pacific(1, "09:00"),
            end_time: pacific(1, "11:00"),
            booked_timezone: BOOKED_TZ,
            ...danaHome,
        },
    });
    await prisma.companyBooking.create({
        data: {
            company_id: culver.id,
            customer_id: priya.id,
            company_service_id: svcDishwasher.id,
            status: BookingStatus.Cancelled,
            start_time: pacific(1, "14:00"),
            end_time: pacific(1, "16:00"),
            // Yesterday, so the cancellation is never stamped in the future —
            // seeding before 5:20 PM would otherwise do exactly that.
            cancelled_at: pacific(-1, "17:20"),
            booked_timezone: BOOKED_TZ,
            ...priyaHome,
        },
    });

    // Santa Monica gets one so the company filter has data on both sides.
    const bookingSantaMonica = await prisma.companyBooking.create({
        data: {
            company_id: santaMonica.id,
            customer_id: marguerite.id,
            company_service_id: svcSantaMonicaFridge.id,
            appliance_brand_id: lg.id,
            status: "Scheduled",
            start_time: pacific(0, "15:00"),
            end_time: pacific(0, "18:00"), // 3 hr windows at this company
            booked_timezone: BOOKED_TZ,
            ...margueriteHome,
        },
    });

    // --- Booking symptoms (a booking can carry more than one) ---
    await prisma.bookingSymptom.createMany({
        data: [
            {
                company_booking_id: bookingCompleted.id,
                symptom_id: dishwasherNotDraining.id,
            },
            {
                company_booking_id: bookingInProgress.id,
                symptom_id: fridgeIceMaker.id,
            },
            {
                company_booking_id: bookingInProgress.id,
                symptom_id: samsungIceFrost.id,
            },
            {
                company_booking_id: bookingScheduled.id,
                symptom_id: ovenNotHeating.id,
            },
            {
                company_booking_id: bookingTomorrow.id,
                symptom_id: fridgeNotCooling.id,
            },
            {
                company_booking_id: bookingSantaMonica.id,
                symptom_id: fridgeLeaking.id,
            },
        ],
    });

    // --- Summary ---
    const [
        orgs,
        companies,
        users,
        memberships,
        applianceTypes,
        brands,
        symptoms,
        services,
        brandSettings,
        bookingSettings,
        dayOfWeekSettings,
        customers,
        customerAddresses,
        bookings,
        bookingSymptoms,
    ] = await Promise.all([
        prisma.organization.count(),
        prisma.company.count(),
        prisma.user.count(),
        prisma.membership.count(),
        prisma.applianceType.count(),
        prisma.brand.count(),
        prisma.symptom.count(),
        prisma.companyService.count(),
        prisma.companyBrandSetting.count(),
        prisma.companyBookingSetting.count(),
        prisma.dayOfWeekSetting.count(),
        prisma.customer.count(),
        prisma.customerAddress.count(),
        prisma.companyBooking.count(),
        prisma.bookingSymptom.count(),
    ]);
    console.log("Seed complete:", {
        orgs,
        companies,
        users,
        memberships,
        applianceTypes,
        brands,
        symptoms,
        services,
        brandSettings,
        bookingSettings,
        dayOfWeekSettings,
        customers,
        customerAddresses,
        bookings,
        bookingSymptoms,
    });
}

seedDev()
    .catch((err) => {
        console.error("Seed failed:", err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
