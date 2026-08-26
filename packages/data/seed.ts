import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client/index.js";
import { slugify } from "@homerepair/utility";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error(
        "DATABASE_URL is not set. Check packages/data/.env and run with cwd = packages/data.",
    );
}

// url-less datasource -> supply the connection via the pg driver adapter.
const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
});

// Every dev user shares this hash — log in as any of them with "password".
// Must stay in sync with the bcrypt.compare in the console's NextAuth
// credentials provider; a failure here should abort the seed rather than
// write unusable password_hash values.
const DEV_PASSWORD_HASH = await bcrypt.hash("password", 10);

async function seedDev() {
    // --- Organization ---
    const org = await prisma.organization.create({
        data: { id: "kyles_group_1", name: "Kyle's Appliance Group" },
    });

    // --- Addresses (one per company) ---
    const culverAddress = await prisma.address.create({
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
    const santaMonicaAddress = await prisma.address.create({
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
    await prisma.symptom.create({
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
    await prisma.companyService.create({
        data: {
            company_id: culver.id,
            appliance_type_id: ovenRange.id,
            job_duration_minutes: 90,
        },
    });
    await prisma.companyService.create({
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
    await prisma.companyService.create({
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

    // Kept only for readability of the dataset above; reference to satisfy lint.
    void lg;
    void fridgeNotCooling;
    void ovenNotHeating;

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
    ] = await Promise.all([
        prisma.organization.count(),
        prisma.company.count(),
        prisma.user.count(),
        prisma.membership.count(),
        prisma.applianceType.count(),
        prisma.brand.count(),
        prisma.symptom.count(),
        prisma.companyService.count(),
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
