"use client";
import { useCompanySettings, useOrganizations } from "@/hooks";
import PageLayout from "@/components/PageLayout";
import Stack from "@mui/material/Stack";
import { Alert, Button, MenuItem, Select, Typography } from "@mui/material";
import FilterChip from "@/components/FilterChip";
import { useState } from "react";
import Brand from "./Brand";
import Availability from "./Availability";
import CardContainer from "@/components/CardContainer";

const NAV_OPTIONS = [
    { id: "hr_branding", label: "Branding & colors" },
    //{ id: "hr_tech", label: "Technicians" },
    { id: "hr_hours", label: "Hours & availability" },
];

const Settings = () => {
    const { currentName } = useOrganizations();
    const [page, setPage] = useState(NAV_OPTIONS[0]?.id as string);
    const {
        companyId,
        draft,
        isLoading,
        isSaving,
        isDirty,
        error,
        updateCompany,
        updateBrand,
        updateHours,
        updateDay,
        save,
        reset,
    } = useCompanySettings();

    return (
        <PageLayout
            title={`Settings`}
            subtitle={currentName}
            isLoading={isLoading || isSaving}
            actionsSlot={
                <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                    <Button
                        sx={{ flexShrink: 0 }}
                        disabled={!isDirty || isSaving}
                        onClick={reset}
                    >
                        Reset
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ flexShrink: 0 }}
                        disabled={!isDirty || isSaving}
                        onClick={save}
                    >
                        {isSaving ? "Saving…" : "Save"}
                    </Button>
                </Stack>
            }
        >
            <Select
                value={page}
                onChange={(event) => setPage(event.target.value)}
                size="small"
                fullWidth
                sx={{
                    display: { xs: "flex", sm: "none" },
                    backgroundColor: "background.paper",
                    marginBottom: 2,
                }}
                slotProps={{ input: { "aria-label": "Settings section" } }}
            >
                {NAV_OPTIONS.map((nav) => {
                    return (
                        <MenuItem key={nav.id} value={nav.id}>
                            {nav.label}
                        </MenuItem>
                    );
                })}
            </Select>

            <Stack
                direction="row"
                sx={{
                    display: { xs: "none", sm: "flex" },
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1.5,
                    marginBottom: 2,
                }}
            >
                {NAV_OPTIONS.map((nav) => {
                    return (
                        <FilterChip
                            key={nav.id}
                            selected={nav.id === page}
                            label={nav.label}
                            onClick={() => {
                                setPage(nav.id);
                            }}
                        />
                    );
                })}
            </Stack>

            {error && (
                <Alert severity="error" sx={{ marginBottom: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Every setting on this page belongs to one company, so there is
                nothing coherent to show while the filter spans several. */}
            {!companyId ? (
                <CardContainer title="Pick a company">
                    <Typography>
                        Branding and hours are configured per company.
                        Choose one from the filter above to edit its settings.
                    </Typography>
                </CardContainer>
            ) : (
                draft && (
                    <>
                        {page === "hr_branding" && (
                            <Brand
                                company={draft.company}
                                brand={draft.brand}
                                onCompanyChange={updateCompany}
                                onBrandChange={updateBrand}
                            />
                        )}
                        {page === "hr_hours" && (
                            <Availability
                                hours={draft.hours}
                                onHoursChange={updateHours}
                                onDayChange={updateDay}
                            />
                        )}
                    </>
                )
            )}
        </PageLayout>
    );
};

export default Settings;
