"use client";

import { daysOfWeek } from "@homerepair/utility";
import { Box, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";

type DayOfWeekBarGraphProps = {
    data: DayOfWeekData[];
};

type DayOfWeekData = {
    dayOfWeekIndex: number;
    count: number;
};

const DayOfWeekBarGraph = (props: DayOfWeekBarGraphProps) => {
    const maxValue = Math.max(0, ...props.data.map((d) => d.count));

    // Calc time after mount to ensure we get viewer's clock not the servers
    const [todayIndex, setTodayIndex] = useState(-1);
    useEffect(() => setTodayIndex(new Date().getDay()), []);
    return (
        <Stack
            direction="row"
            spacing={{ xs: 0.75, sm: 2 }}
            sx={{
                alignItems: "flex-end",
                justifyContent: "space-between",
                height: { xs: "160px", sm: "200px" },
                width: "100%",
                marginTop: 2,
            }}
        >
                {daysOfWeek.map((dow) => {
                    const data = props.data.find(
                        (d) => d.dayOfWeekIndex === dow.index,
                    );
                    const count = data?.count ?? 0;
                    const isCurrentDayOfWeek = todayIndex === dow.index;

                    const relativeHeight =
                        maxValue > 0 ? (count / maxValue) * 100 : 0;
                    return (
                        <Stack
                            key={dow.index}
                            sx={{
                                // Flex rather than a fixed 45px: seven rigid
                                // columns plus gaps overflow a phone screen.
                                flex: "1 1 0",
                                minWidth: 0,
                                maxWidth: "45px",
                                alignItems: "center",
                                height: "100%",
                                justifyContent: "flex-end",
                                paddingTop: 3,
                            }}
                        >
                            <Box
                                sx={{
                                    flexGrow: 1,
                                    minHeight: 0,
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "flex-end",
                                }}
                            >
                                <Box
                                    sx={{
                                        position: "relative",
                                        height: `${relativeHeight == 0 ? 1.5 : relativeHeight}%`,
                                        width: "100%",
                                        backgroundColor: isCurrentDayOfWeek
                                            ? "primary.main"
                                            : "chartMuted",
                                        borderRadius: 1,
                                    }}
                                >
                                    <Typography
                                        variant="label"
                                        sx={{
                                            position: "absolute",
                                            bottom: "100%",
                                            left: 0,
                                            right: 0,
                                            textAlign: "center",
                                            paddingBottom: 0.5,
                                        }}
                                    >
                                        {count}
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="label">
                                {dow.labelShort}
                            </Typography>
                        </Stack>
                    );
                })}
        </Stack>
    );
};

export default DayOfWeekBarGraph;
