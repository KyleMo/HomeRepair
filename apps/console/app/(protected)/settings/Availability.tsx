"use client";

import CardContainer from "@/components/CardContainer";
import IOSSwitch from "@/components/IOSSwitch";
import {
    DayOfWeek,
    buildTimeSlots,
    daysOfWeek,
    formatClockTime,
} from "@homerepair/utility";
import {
    Grid,
    MenuItem,
    Select,
    Slider,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import { useState } from "react";

/** Built once — the list is identical for every select on the page. */
const TIME_SLOTS = buildTimeSlots();

/** Selectable arrival window lengths, in hours. */
const WINDOW_LENGTHS = [2, 3, 4];

const MIN_JOBS_PER_WINDOW = 1;
const MAX_JOBS_PER_WINDOW = 10;

const Availability = () => {
    return (
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ width: "100%" }}>
            <Grid size={12}>
                <Stack sx={{ gap: { xs: 2, md: 3 } }}>
                    <CardContainer
                        title="Business Hours"
                        subtitle="Arrival windows are only offered inside these hours."
                    >
                        <Stack sx={{ gap: 1 }}>
                            {daysOfWeek.map((dow) => (
                                <AvailabilityDowConfig
                                    key={dow.index}
                                    dayOfWeek={dow}
                                />
                            ))}
                        </Stack>
                    </CardContainer>
                </Stack>
            </Grid>
            <Grid size={6}>
                <CardContainer
                    title="Arrival Windows"
                    subtitle="How the booking flow slices your day."
                >
                    <ArrivalWindows />
                </CardContainer>
            </Grid>
        </Grid>
    );
};

const ArrivalWindows = () => {
    const [windowHours, setWindowHours] = useState(2);
    const [jobsPerWindow, setJobsPerWindow] = useState(3);

    return (
        <Stack sx={{ gap: 3 }}>
            <Stack sx={{ gap: 1 }}>
                <Typography
                    variant="label"
                    sx={{ color: "#000000", fontSize: 15 }}
                >
                    Window length
                </Typography>
                <ToggleButtonGroup
                    exclusive
                    value={windowHours}
                    aria-label="Window length"
                    sx={{
                        gap: 1.5,
                        "& .MuiToggleButtonGroup-grouped": {
                            flex: 1,
                            margin: 0,
                            paddingY: 1.25,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: "10px",
                            fontSize: 15,
                            fontWeight: 650,
                            color: "text.primary",
                            "&:not(:first-of-type)": {
                                marginLeft: 0,
                                borderLeft: "1px solid",
                                borderColor: "divider",
                                borderTopLeftRadius: "10px",
                                borderBottomLeftRadius: "10px",
                            },
                            "&:not(:last-of-type)": {
                                borderTopRightRadius: "10px",
                                borderBottomRightRadius: "10px",
                            },
                            // Same token pairing as FilterChip, so a selected
                            // pill and a selected window read as one system.
                            "&.Mui-selected": {
                                backgroundColor: "secondary.main",
                                borderColor: "primary.main",
                                color: "secondary.contrastText",
                                fontWeight: 700,
                                "&:hover": {
                                    backgroundColor: "secondary.light",
                                },
                            },
                        },
                    }}
                >
                    {WINDOW_LENGTHS.map((hours) => (
                        <ToggleButton
                            key={hours}
                            value={hours}
                            aria-label={`${hours} hour windows`}
                        >
                            {hours} hr
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Stack>

            <Stack sx={{ gap: 0.5 }}>
                <Stack
                    direction="row"
                    sx={{
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                    }}
                >
                    <Typography
                        variant="label"
                        sx={{ color: "#000000", fontSize: 15 }}
                        id="jobs-per-window-label"
                    >
                        Jobs per window
                    </Typography>
                    {/* Rendered here rather than via valueLabelDisplay, which
                        is a bubble that only shows on hover and drag. */}
                    <Typography
                        variant="label"
                        sx={{ color: "#000000", fontSize: 15 }}
                    >
                        {jobsPerWindow}
                    </Typography>
                </Stack>

                <Slider
                    value={jobsPerWindow}
                    onChange={(_event, next) => setJobsPerWindow(next)}
                    min={MIN_JOBS_PER_WINDOW}
                    max={MAX_JOBS_PER_WINDOW}
                    step={1}
                    aria-labelledby="jobs-per-window-label"
                    sx={{
                        height: 8,
                        "& .MuiSlider-rail": {
                            backgroundColor: "divider",
                            opacity: 1,
                        },
                        "& .MuiSlider-thumb": { width: 20, height: 20 },
                    }}
                />

                <Typography
                    variant="label"
                    sx={{ fontSize: 12.5, fontWeight: 500 }}
                >
                    Across 2 active technicians
                </Typography>
            </Stack>
        </Stack>
    );
};

type AvailabilityDowConfigProps = {
    dayOfWeek: DayOfWeek;
};

const AvailabilityDowConfig = ({ dayOfWeek }: AvailabilityDowConfigProps) => {
    const [open, setOpen] = useState(true);
    return (
        <Stack
            direction="row"
            sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
            <Stack
                direction="row"
                sx={{
                    alignItems: "center",
                    gap: 2,
                    justifyContent: "space-between",
                    width: { xs: "100%", sm: "100%", md: 425 },
                }}
            >
                <Stack
                    direction="row"
                    sx={{
                        alignItems: "center",
                        gap: 2,
                        flexShrink: 0,
                    }}
                >
                    <IOSSwitch
                        checked={open}
                        onChange={() => setOpen((prev) => !prev)}
                    />
                    <Typography
                        variant="label"
                        sx={{ color: "#000000", fontSize: 15 }}
                    >
                        {dayOfWeek.label}
                    </Typography>
                </Stack>
                <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                    {open ? (
                        <>
                            <Select
                                size="small"
                                value="09:00"
                                sx={{ width: 116, flexShrink: 0 }}
                            >
                                {TIME_SLOTS.map((ts) => (
                                    <MenuItem key={ts} value={ts}>
                                        {formatClockTime(ts)}
                                    </MenuItem>
                                ))}
                            </Select>
                            <Typography>to</Typography>
                            <Select
                                size="small"
                                value="17:00"
                                sx={{ width: 116, flexShrink: 0 }}
                            >
                                {TIME_SLOTS.map((ts) => (
                                    <MenuItem key={ts} value={ts}>
                                        {formatClockTime(ts)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </>
                    ) : (
                        <Typography sx={{ paddingY: 1 }}>Closed</Typography>
                    )}
                </Stack>
            </Stack>

            <Typography
                variant="label"
                sx={{ display: { xs: "none", sm: "none", md: "block" } }}
            >
                5 × 2 hr windows · 15 slots
            </Typography>
        </Stack>
    );
};

export default Availability;
