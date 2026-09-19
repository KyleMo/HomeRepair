"use client";
import type {
    BrandSettings,
    CompanyIdentity,
    CompanySettings,
    DaySettings,
    HoursSettings,
    SettingsPatch,
} from "@/types/setting";
import type { Weekday } from "@homerepair/data/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { OrganizationContext } from "./components/providers/OrganizationProvider";

export type ValidatedSession = Session & {
    user: {
        first_name: string;
        last_name: string;
        email: string;
        image?: string | null;
    };
};

export const useValidatedSession = (): ValidatedSession => {
    const session = useSession({
        required: true,
        onUnauthenticated() {
            redirect("/auth/log-in");
        },
    });

    if (session.status === "loading") {
        throw new Promise<void>(() => {});
    }

    const { user } = session.data;

    if (!user.email || !user.first_name) {
        redirect("/auth/log-in");
    }

    return {
        ...session.data,
        user: {
            ...user,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
        },
    };
};

export const useOrganizations = () => {
    return useContext(OrganizationContext);
};

/**
 * Structural comparison, which is all the settings payload needs: every value
 * in it is a string, number, boolean or an array of those, and both sides are
 * built from the same shape, so their keys always come out in the same order.
 */
const isEqual = (a: unknown, b: unknown) =>
    JSON.stringify(a) === JSON.stringify(b);

/** Shared with anything that wants to read or invalidate the same fetch. */
export const settingsQueryKey = (companyId: string) => [
    "company-settings",
    companyId,
];

/** Settings are per company rather than per organization **/
export const useCompanySettings = () => {
    const { companyFilter, companyQuery } = useOrganizations();
    const queryClient = useQueryClient();

    // "All" over a single-company org still names exactly one company, so the
    // page works there without making anyone narrow a filter of one.
    const companyId =
        companyFilter !== "all"
            ? companyFilter
            : companyQuery.length === 1
              ? (companyQuery[0] ?? null)
              : null;

    // `saved` is the server's last word and `draft` is what the fields edit;
    // holding the pair together is what makes "is there anything to save" and
    // Reset answerable without a second source of truth.
    const [state, setState] = useState<{
        companyId: string;
        saved: CompanySettings;
        draft: CompanySettings;
    } | null>(null);

    const {
        data,
        isLoading,
        error: loadError,
    } = useQuery<CompanySettings>({
        queryKey: settingsQueryKey(companyId ?? ""),
        enabled: !!companyId,
        queryFn: async () => {
            const response = await fetch(`/api/company/${companyId}/setting`);

            if (!response.ok)
                throw new Error(`Failed to load settings (${response.status})`);

            return (await response.json()) as CompanySettings;
        },
    });

    useEffect(() => {
        if (!data) return;

        setState((current) => {
            // A refetch shouldn't throw away half-finished edits, so the
            // server's copy only takes over the draft when nothing is pending.
            const keepDraft =
                current?.companyId === data.company.id &&
                !isEqual(current.draft, current.saved);

            return {
                companyId: data.company.id,
                saved: data,
                draft: keepDraft ? current.draft : data,
            };
        });
    }, [data]);

    // Switching to a filter this page can't edit leaves no draft behind.
    useEffect(() => {
        if (!companyId) setState(null);
    }, [companyId]);

    const mutation = useMutation({
        mutationFn: async (patch: SettingsPatch) => {
            const response = await fetch(`/api/company/${companyId}/setting`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patch),
            });

            const body = await response.json();

            if (!response.ok)
                throw new Error(
                    typeof body?.error === "string"
                        ? body.error
                        : `Failed to save settings (${response.status})`,
                );

            return body as CompanySettings;
        },
        onSuccess: (saved) => {
            setState({ companyId: saved.company.id, saved, draft: saved });
            queryClient.setQueryData(settingsQueryKey(saved.company.id), saved);
        },
    });

    const editDraft = (edit: (draft: CompanySettings) => CompanySettings) =>
        setState((current) =>
            current ? { ...current, draft: edit(current.draft) } : current,
        );

    const updateCompany = (patch: Partial<CompanyIdentity>) =>
        editDraft((draft) => ({
            ...draft,
            company: { ...draft.company, ...patch },
        }));

    const updateBrand = (patch: Partial<BrandSettings>) =>
        editDraft((draft) => ({
            ...draft,
            brand: { ...draft.brand, ...patch },
        }));

    const updateHours = (patch: Partial<Omit<HoursSettings, "days">>) =>
        editDraft((draft) => ({
            ...draft,
            hours: { ...draft.hours, ...patch },
        }));

    const updateDay = (weekDay: Weekday, patch: Partial<DaySettings>) =>
        editDraft((draft) => ({
            ...draft,
            hours: {
                ...draft.hours,
                days: draft.hours.days.map((day) =>
                    day.week_day === weekDay ? { ...day, ...patch } : day,
                ),
            },
        }));

    const isDirty = !!state && !isEqual(state.draft, state.saved);

    /**
     * Only the sections that changed go over the wire. The endpoint patches by
     * section, so an untouched tab is left alone rather than rewritten with
     * values the page may have loaded minutes ago.
     */
    const save = () => {
        if (!state || !isDirty || mutation.isPending) return;

        const { draft, saved } = state;
        const patch: SettingsPatch = {};

        if (!isEqual(draft.company, saved.company))
            patch.company = {
                name: draft.company.name,
                phone: draft.company.phone,
                timezone: draft.company.timezone,
            };

        if (!isEqual(draft.brand, saved.brand)) patch.brand = draft.brand;
        if (!isEqual(draft.hours, saved.hours)) patch.hours = draft.hours;

        mutation.mutate(patch);
    };

    const reset = () =>
        setState((current) =>
            current ? { ...current, draft: current.saved } : current,
        );

    return {
        companyId,
        draft: state?.draft ?? null,
        isLoading: isLoading && !!companyId,
        isSaving: mutation.isPending,
        isDirty,
        error: mutation.error?.message ?? loadError?.message ?? null,
        updateCompany,
        updateBrand,
        updateHours,
        updateDay,
        save,
        reset,
    };
};
