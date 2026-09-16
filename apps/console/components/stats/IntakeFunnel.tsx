import { LinearProgress, Stack, Typography } from "@mui/material";

const INTAKE_DATA = [
    { id: "start_intake", title: "Started intake", count: 86 },
    { id: "reached_scheduling", title: "Reach Scheduling", count: 35 },
    { id: "confirmed_booking", title: "Confirmed Booking", count: 25 },
    { id: "completed_job", title: "Completed Job", count: 23 },
];

const IntakeFunnel = () => {
    const relativeMax =
        INTAKE_DATA.find((d) => d.id === "start_intake")?.count ?? 0;

    return (
        <Stack spacing={2} sx={{ marginTop: 2 }}>
                {INTAKE_DATA.map((d) => {
                    const lengthPercent =
                        relativeMax === 0
                            ? 1.75
                            : Math.max(1.75, (d.count / relativeMax) * 100);
                    return (
                        <Stack spacing={0.75} key={d.id}>
                            <Stack
                                direction="row"
                                sx={{ justifyContent: "space-between" }}
                            >
                                <Typography variant="label">
                                    {d.title}
                                </Typography>
                                <Typography
                                    variant="label"
                                    sx={{
                                        color: "text.primary",
                                        fontWeight: 700,
                                    }}
                                >
                                    {d.count}
                                </Typography>
                            </Stack>
                            <LinearProgress
                                variant="determinate"
                                value={lengthPercent}
                                aria-label={d.title}
                                sx={{
                                    height: 8,
                                    backgroundColor: "divider",
                                    "& .MuiLinearProgress-bar": {
                                        backgroundColor: "primary.main",
                                    },
                                }}
                            />
                        </Stack>
                    );
                })}
        </Stack>
    );
};

export default IntakeFunnel;
