import { Chip, Divider, Grid, Stack, Typography } from "@mui/material";

type JobStatus = "scheduled" | "in_progress" | "done";

type Job = {
    id: string;
    time: string;
    customer: string;
    service: string;
    technician: string;
    status: JobStatus;
};

// The theme already pairs chip colours with these states:
// success -> done, warning -> in progress, default -> scheduled.
const STATUS_CHIP: Record<
    JobStatus,
    { label: string; color: "success" | "warning" | "default" }
> = {
    done: { label: "Done", color: "success" },
    in_progress: { label: "In progress", color: "warning" },
    scheduled: { label: "Scheduled", color: "default" },
};

const TODAY_JOBS: Job[] = [
    {
        id: "1",
        time: "8:00 AM",
        customer: "Dana Whitfield",
        service: "Dishwasher — won't drain",
        technician: "Marcus R.",
        status: "done",
    },
    {
        id: "2",
        time: "9:30 AM",
        customer: "Priya Raman",
        service: "Refrigerator — icemaker leak",
        technician: "Marcus R.",
        status: "done",
    },
    {
        id: "3",
        time: "11:00 AM",
        customer: "Ellis Brandt",
        service: "Dryer — no heat",
        technician: "Tasha B.",
        status: "in_progress",
    },
    {
        id: "4",
        time: "1:15 PM",
        customer: "Owen Castellanos",
        service: "Oven — igniter replacement",
        technician: "Tasha B.",
        status: "scheduled",
    },
    {
        id: "5",
        time: "3:00 PM",
        customer: "Marguerite Doyle",
        service: "Washer — drum bearing noise",
        technician: "Unassigned",
        status: "scheduled",
    },
];

const TodayJobs = () => {
    return (
        <Stack divider={<Divider />} sx={{ marginTop: 2 }}>
                {TODAY_JOBS.map((job) => {
                    const chip = STATUS_CHIP[job.status];
                    return (
                        <Grid
                            container
                            spacing={1}
                            key={job.id}
                            sx={{
                                alignItems: "center",
                                paddingY: 1.5,
                            }}
                        >
                            <Grid size={{ xs: 5, sm: 2 }}>
                                <Typography
                                    variant="label"
                                    sx={{
                                        color: "text.primary",
                                        fontWeight: 700,
                                    }}
                                >
                                    {job.time}
                                </Typography>
                            </Grid>

                            {/* On phones the chip rides up beside the time and
                                the job details take the full row beneath. */}
                            <Grid
                                size={{ xs: 7, sm: 2 }}
                                sx={{
                                    order: { xs: 1, sm: 3 },
                                    display: "flex",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <Chip
                                    size="small"
                                    label={chip.label}
                                    color={chip.color}
                                />
                            </Grid>

                            <Grid
                                size={{ xs: 12, sm: 5 }}
                                sx={{ order: { xs: 2, sm: 1 }, minWidth: 0 }}
                            >
                                <Typography noWrap sx={{ fontWeight: 600 }}>
                                    {job.customer}
                                </Typography>
                                <Typography variant="label" noWrap>
                                    {job.service}
                                </Typography>
                            </Grid>

                            <Grid
                                size={{ xs: 12, sm: 3 }}
                                sx={{ order: { xs: 3, sm: 2 }, minWidth: 0 }}
                            >
                                <Typography variant="label" noWrap>
                                    {job.technician}
                                </Typography>
                            </Grid>
                        </Grid>
                    );
                })}
            </Stack>
    );
};

export default TodayJobs;
