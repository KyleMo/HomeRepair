import { withCompanyAccess } from "@/lib/api";
import { getCompanySettings, updateCompanySettings } from "@/lib/db/setting";
import { settingsPatchSchema } from "@/types/setting";
import { NextResponse } from "next/server";

/**
 * GET /api/company/[companyId]/setting
 *
 * The company's branding, hours and routing settings — everything the console's
 * Settings page renders. Settings belong to a company rather than to the
 * organization it sits under: two companies in one org have their own palette,
 * their own week, and their own view of which jobs they'll take.
 */
export const GET = withCompanyAccess(async (_request, { companyId }) => {
    try {
        const settings = await getCompanySettings(companyId);

        if (!settings)
            return NextResponse.json({ error: "Not found" }, { status: 404 });

        return NextResponse.json(settings);
    } catch (error) {
        console.error("[GET company settings]", error);
        return NextResponse.json(
            { error: "Failed to load settings" },
            { status: 500 },
        );
    }
});

/**
 * PATCH /api/company/[companyId]/setting
 *
 * Partial by section — a tab sends only what it owns and the rest is left
 * alone. Responds with the saved settings so the client swaps in what the
 * database actually holds rather than trusting its own optimistic copy.
 */
export const PATCH = withCompanyAccess(async (request, { companyId }) => {
    try {
        const result = settingsPatchSchema.safeParse(await request.json());

        if (!result.success)
            return NextResponse.json(
                { error: result.error.message },
                { status: 400 },
            );

        const updated = await updateCompanySettings(companyId, result.data);

        if (!updated.success)
            return NextResponse.json(
                { error: updated.error },
                { status: 400 },
            );

        return NextResponse.json(updated.value);
    } catch (error) {
        console.error("[PATCH company settings]", error);
        return NextResponse.json(
            { error: "Failed to save settings" },
            { status: 500 },
        );
    }
});
