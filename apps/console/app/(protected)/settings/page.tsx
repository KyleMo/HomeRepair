"use client";
import { useOrganizations, useValidatedSession } from "@/hooks";
import PageLayout from "@/components/PageLayout";
import Stack from "@mui/material/Stack";
import { Button, MenuItem, Select } from "@mui/material";
import FilterChip from "@/components/FilterChip";
import { useState } from "react";
import Brand from "./Brand";
import Availability from "./Availability";

const NAV_OPTIONS = [
    { id: "hr_branding", label: "Branding & colors" },
    //{ id: "hr_tech", label: "Technicians" },
    { id: "hr_hours", label: "Hours & availability" },
];

const Settings = () => {
    const { currentName } = useOrganizations();
    const [page, setPage] = useState(NAV_OPTIONS[0]?.id as string);

    return (
        <PageLayout
            title={`Settings`}
            subtitle={currentName}
            actionsSlot={
                <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                    <Button sx={{ flexShrink: 0 }}>Reset</Button>
                    <Button variant="contained" sx={{ flexShrink: 0 }}>
                        Save
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
            {page == "hr_branding" && <Brand />}
            {page === "hr_hours" && <Availability />}
        </PageLayout>
    );
};

export default Settings;
