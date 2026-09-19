"use client";

import CardContainer from "@/components/CardContainer";
import IOSSwitch from "@/components/IOSSwitch";
import {
    MAX_JOBS_PER_WINDOW,
    MIN_JOBS_PER_WINDOW,
    WINDOW_LENGTHS_MINUTES,
    type DaySettings,
    type HoursSettings,
} from "@/types/setting";
import type { Weekday } from "@homerepair/data/types";
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

/** Built once — the list is identical for every select on the page. */
const TIME_SLOTS = buildTimeSlots();

const MINUTES_PER_HOUR = 60;

/** "09:00" -> 540. Fixed-width 24h input, as the column stores. */
const toMinutes = (time: string) =>
    Number(time.slice(0, 2)) * MINUTES_PER_HOUR + Number(time.slice(3, 5));

const dayCapacity = (
    day: DaySettings,
    windowLengthMinutes: number,
    jobsPerWindow: number,
) => {
    if (!day.is_open) return { windows: 0, slots: 0 };

    const windows = Math.floor(
        (toMinutes(day.close_at) - toMinutes(day.open_at)) /
            windowLengthMinutes,
    );

    return { windows, slots: windows * jobsPerWindow };
};

type AvailabilityProps = {
    hours: HoursSettings;
    onHoursChange: (patch: Partial<Omit<HoursSettings, "days">>) => void;
    onDayChange: (weekDay: Weekday, patch: Partial<DaySettings>) => void;
};

const Availability = ({
    hours,
    onHoursChange,
    onDayChange,
}: AvailabilityProps) => {
    return (
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ width: "100%" }}>
            <Grid size={12}>
                <Stack sx={{ gap: { xs: 2, md: 3 } }}>
                    <CardContainer
                        title="Business Hours"
                        subtitle="Arrival windows are only offered inside these hours."
                    >
                        <Stack sx={{ gap: 1 }}>
                            {daysOfWeek.map((dow) => {
                                // The API always sends all seven days, Sunday
                                // first, so this pairs up one-to-one.
                                const day = hours.days[dow.index];
                                if (!day) return null;

                                return (
                                    <AvailabilityDowConfig
                                        key={dow.index}
                                        dayOfWeek={dow}
                                        day={day}
                                        windowLengthMinutes={
                                            hours.default_window_length_minutes
                                        }
                                        jobsPerWindow={
                                            hours.allowed_jobs_per_window
                                        }
                                        onChange={(patch) =>
                                            onDayChange(day.week_day, patch)
                                        }
                                    />
                                );
                            })}
                        </Stack>
                    </CardContainer>
                </Stack>
            </Grid>
            <Grid size={6}>
                <CardContainer
                    title="Arrival Windows"
                    subtitle="How the booking flow slices your day."
                >
                    <ArrivalWindows
                        hours={hours}
                        onHoursChange={onHoursChange}
                    />
                </CardContainer>
            </Grid>
        </Grid>
    );
};

type ArrivalWindowsProps = {
    hours: HoursSettings;
    onHoursChange: (patch: Partial<Omit<HoursSettings, "days">>) => void;
};

const ArrivalWindows = ({ hours, onHoursChange }: ArrivalWindowsProps) => {
    const windowMinutes = hours.default_window_length_minutes;
    const jobsPerWindow = hours.allowed_jobs_per_window;

    const weeklySlots = hours.days.reduce(
        (total, day) =>
            total + dayCapacity(day, windowMinutes, jobsPerWindow).slots,
        0,
    );

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
                    value={windowMinutes}
                    onChange={(_event, minutes) =>
                        // null arrives when the selected button is clicked
                        // again; a company always has a window length, so the
                        // deselect is ignored rather than stored.
                        minutes !== null &&
                        onHoursChange({
                            default_window_length_minutes: minutes,
                        })
                    }
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
                    {WINDOW_LENGTHS_MINUTES.map((minutes) => {
                        const hoursLong = minutes / MINUTES_PER_HOUR;

                        return (
                            <ToggleButton
                                key={minutes}
                                value={minutes}
                                aria-label={`${hoursLong} hour windows`}
                            >
                                {hoursLong} hr
                            </ToggleButton>
                        );
                    })}
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
                    onChange={(_event, next) =>
                        onHoursChange({ allowed_jobs_per_window: next })
                    }
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
                    {weeklySlots} bookable slots a week
                </Typography>
            </Stack>
        </Stack>
    );
};

type AvailabilityDowConfigProps = {
    dayOfWeek: DayOfWeek;
    day: DaySettings;
    windowLengthMinutes: number;
    jobsPerWindow: number;
    onChange: (patch: Partial<DaySettings>) => void;
};

const AvailabilityDowConfig = ({
    dayOfWeek,
    day,
    windowLengthMinutes,
    jobsPerWindow,
    onChange,
}: AvailabilityDowConfigProps) => {
    const { windows, slots } = dayCapacity(
        day,
        windowLengthMinutes,
        jobsPerWindow,
    );

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
                        checked={day.is_open}
                        // Closing a day keeps its hours, so switching it back
                        // on restores what was there rather than the default.
                        onChange={(event) =>
                            onChange({ is_open: event.target.checked })
                        }
                        slotProps={{
                            input: {
                                "aria-label": `${dayOfWeek.label} open`,
                            },
                        }}
                    />
                    <Typography
                        variant="label"
                        sx={{ color: "#000000", fontSize: 15 }}
                    >
                        {dayOfWeek.label}
                    </Typography>
                </Stack>
                <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                    {day.is_open ? (
                        <>
                            <Select
                                size="small"
                                value={day.open_at}
                                onChange={(event) =>
                                    onChange({ open_at: event.target.value })
                                }
                                sx={{ width: 116, flexShrink: 0 }}
                                slotProps={{
                                    input: {
                                        "aria-label": `${dayOfWeek.label} opens at`,
                                    },
                                }}
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
                                value={day.close_at}
                                onChange={(event) =>
                                    onChange({ close_at: event.target.value })
                                }
                                sx={{ width: 116, flexShrink: 0 }}
                                slotProps={{
                                    input: {
                                        "aria-label": `${dayOfWeek.label} closes at`,
                                    },
                                }}
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
                {day.is_open
                    ? `${windows} × ${windowLengthMinutes / MINUTES_PER_HOUR} hr windows · ${slots} slots`
                    : ""}
            </Typography>
        </Stack>
    );
};

export default Availability;
