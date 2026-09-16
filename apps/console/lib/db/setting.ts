import { CompanyId } from "@/types/organization";
import {
    CompanySettings,
    DEFAULT_BOOKING_SETTINGS,
    DEFAULT_BRAND_SETTINGS,
    DEFAULT_DAY_SETTINGS,
    DaySettings,
    SettingsPatch,
    WEEKDAYS,
} from "@/types/setting";
import { prisma } from "@homerepair/data";
import { Result } from "@homerepair/utility/types";

export const getCompanySettings = async (
    companyId: CompanyId,
): Promise<CompanySettings | null> => {
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: {
            brand_setting: true,
            booking_setting: { include: { days_of_the_week: true } },
            company_services: {
                include: { appliance_type: { select: { name: true } } },
                orderBy: { appliance_type: { name: "asc" } },
            },
            brand_rules: {
                include: {
                    brand: { select: { name: true } },
                    appliance_type: { select: { name: true } },
                },
                orderBy: { brand: { name: "asc" } },
            },
            symptom_rules: {
                include: { symptom: { select: { name: true } } },
                orderBy: { symptom: { name: "asc" } },
            },
        },
    });

    if (!company) return null;

    const brand = company.brand_setting ?? DEFAULT_BRAND_SETTINGS;
    const booking = company.booking_setting ?? DEFAULT_BOOKING_SETTINGS;

    return {
        company: {
            id: company.id,
            slug: company.slug,
            name: company.name,
            phone: company.phone,
            timezone: company.timezone,
        },
        brand: {
            primary_color: brand.primary_color,
            secondary_color: brand.secondary_color,
            selected_fill: brand.selected_fill,
            selected_text: brand.selected_text,
            body_text: brand.body_text,
            button_text: brand.button_text,
            page_background: brand.page_background,
            corner_radius: brand.corner_radius,
            font: brand.font,
            logo_url: brand.logo_url,
        },
        hours: {
            default_window_length_minutes:
                booking.default_window_length_minutes,
            allowed_jobs_per_window: booking.allowed_jobs_per_window,
            days: buildWeek(company.booking_setting?.days_of_the_week ?? []),
        },
        routing: {
            services: company.company_services.map((service) => ({
                id: service.id,
                appliance_type_id: service.appliance_type_id,
                appliance_type_name: service.appliance_type.name,
                enabled: service.enabled,
                job_duration_minutes: service.job_duration_minutes,
            })),
            brand_rules: company.brand_rules.map((rule) => ({
                brand_id: rule.brand_id,
                brand_name: rule.brand.name,
                appliance_type_id: rule.appliance_type_id,
                appliance_type_name: rule.appliance_type?.name ?? null,
                rule: rule.rule,
            })),
            symptom_rules: company.symptom_rules.map((rule) => ({
                symptom_id: rule.symptom_id,
                symptom_name: rule.symptom.name,
                rule: rule.rule,
            })),
        },
    };
};

/**
 * All seven days, Sunday first, whether or not a row exists for each.
 *
 * The schema doesn't guarantee a row per weekday — the seed writes all seven,
 * but a company set up by hand may have none — and a week with gaps would give
 * the page a list that changes length, so the stored rows are laid over a full
 * default week instead.
 */
const buildWeek = (
    stored: {
        week_day: string;
        is_open: boolean;
        open_at: string;
        close_at: string;
    }[],
): DaySettings[] =>
    WEEKDAYS.map((week_day) => {
        const day = stored.find((d) => d.week_day === week_day);

        return {
            week_day,
            is_open: day?.is_open ?? DEFAULT_DAY_SETTINGS.is_open,
            open_at: day?.open_at ?? DEFAULT_DAY_SETTINGS.open_at,
            close_at: day?.close_at ?? DEFAULT_DAY_SETTINGS.close_at,
        };
    });

/**
 * Applies a partial settings patch and reads the company's settings back.
 *
 * Everything runs in one transaction: the three sections are edited from one
 * page behind one Save, so a half-applied save would leave the page showing a
 * state the company was never actually in.
 */
export const updateCompanySettings = async (
    companyId: CompanyId,
    patch: SettingsPatch,
): Promise<Result<CompanySettings>> => {
    const referenceCheck = await assertRoutingReferences(companyId, patch);
    if (!referenceCheck.success) return referenceCheck;

    await prisma.$transaction(async (tx) => {
        if (patch.company) {
            await tx.company.update({
                where: { id: companyId },
                data: patch.company,
            });
        }

        if (patch.brand) {
            await tx.companyBrandSetting.upsert({
                where: { company_id: companyId },
                create: {
                    company_id: companyId,
                    ...DEFAULT_BRAND_SETTINGS,
                    ...patch.brand,
                },
                update: patch.brand,
            });
        }

        if (patch.hours) {
            const { days, ...booking } = patch.hours;

            const bookingSetting = await tx.companyBookingSetting.upsert({
                where: { company_id: companyId },
                create: {
                    company_id: companyId,
                    ...DEFAULT_BOOKING_SETTINGS,
                    ...booking,
                },
                update: booking,
            });

            // Upserted one at a time rather than deleted and recreated: the
            // rows are referenced by id, and a day the patch left out keeps
            // whatever it had.
            for (const day of days ?? []) {
                await tx.dayOfWeekSetting.upsert({
                    where: {
                        company_booking_setting_id_week_day: {
                            company_booking_setting_id: bookingSetting.id,
                            week_day: day.week_day,
                        },
                    },
                    create: {
                        company_booking_setting_id: bookingSetting.id,
                        ...day,
                    },
                    update: day,
                });
            }
        }

        if (patch.routing) {
            const { services, brand_rules, symptom_rules } = patch.routing;

            for (const { id, ...service } of services ?? []) {
                // updateMany, not update: the company_id in the where clause
                // makes it a no-op for a service id belonging to someone else.
                await tx.companyService.updateMany({
                    where: { id, company_id: companyId },
                    data: service,
                });
            }

            // Rules have no stable identity of their own — the page edits a
            // set, not rows — so each list is replaced wholesale.
            if (brand_rules) {
                await tx.companyBrandRule.deleteMany({
                    where: { company_id: companyId },
                });
                await tx.companyBrandRule.createMany({
                    data: brand_rules.map((rule) => ({
                        company_id: companyId,
                        brand_id: rule.brand_id,
                        appliance_type_id: rule.appliance_type_id ?? null,
                        rule: rule.rule,
                    })),
                });
            }

            if (symptom_rules) {
                await tx.companySymptomRule.deleteMany({
                    where: { company_id: companyId },
                });
                await tx.companySymptomRule.createMany({
                    data: symptom_rules.map((rule) => ({
                        company_id: companyId,
                        symptom_id: rule.symptom_id,
                        rule: rule.rule,
                    })),
                });
            }
        }
    });

    const settings = await getCompanySettings(companyId);

    return settings
        ? { success: true, value: settings }
        : { success: false, error: `Company ${companyId} no longer exists` };
};

/**
 * Brands, appliance types and symptoms are either the system's (company_id
 * null) or a company's own, and nothing in the database stops one company
 * writing a rule against another's. Checked up front so an unreachable id is a
 * 400 rather than a foreign key error from inside the transaction.
 */
const assertRoutingReferences = async (
    companyId: CompanyId,
    patch: SettingsPatch,
): Promise<Result<true>> => {
    const routing = patch.routing;
    if (!routing) return { success: true, value: true };

    // System-owned rows have a null company_id and are usable by everyone.
    const ownedByCompanyOrSystem = {
        OR: [{ company_id: null }, { company_id: companyId }],
    };

    const brandIds = [
        ...new Set((routing.brand_rules ?? []).map((r) => r.brand_id)),
    ];
    const applianceTypeIds = [
        ...new Set(
            (routing.brand_rules ?? [])
                .map((r) => r.appliance_type_id)
                .filter((id): id is string => !!id),
        ),
    ];
    const symptomIds = [
        ...new Set((routing.symptom_rules ?? []).map((r) => r.symptom_id)),
    ];

    const [brands, applianceTypes, symptoms] = await Promise.all([
        prisma.brand.count({
            where: { id: { in: brandIds }, ...ownedByCompanyOrSystem },
        }),
        prisma.applianceType.count({
            where: { id: { in: applianceTypeIds }, ...ownedByCompanyOrSystem },
        }),
        prisma.symptom.count({
            where: { id: { in: symptomIds }, ...ownedByCompanyOrSystem },
        }),
    ]);

    if (brands !== brandIds.length)
        return { success: false, error: "Unknown brand in brand_rules" };
    if (applianceTypes !== applianceTypeIds.length)
        return {
            success: false,
            error: "Unknown appliance type in brand_rules",
        };
    if (symptoms !== symptomIds.length)
        return { success: false, error: "Unknown symptom in symptom_rules" };

    return { success: true, value: true };
};
