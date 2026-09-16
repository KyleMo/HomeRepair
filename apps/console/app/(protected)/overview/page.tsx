"use client";
import { greetingByTimeOfDay } from "@homerepair/utility/client";
import {
    Box,
    Button,
    Grid,
    MenuItem,
    Select,
    Stack,
    Typography,
} from "@mui/material";
import { useOrganizations, useValidatedSession } from "@/hooks";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { useState } from "react";
import DayOfWeekBarGraph from "@/components/stats/DayOfWeekBarGraph";
import IntakeFunnel from "@/components/stats/IntakeFunnel";
import TodayJobs from "@/components/stats/TodayJobs";
import PageLayout from "@/components/PageLayout";
import CardContainer from "@/components/CardContainer";

const STATS = [
    {
        label: "Bookings this week",
        value: "62",
        change: "18% vs last week",
        increase: true,
    },
    {
        label: "Jobs today",
        value: "12",
        change: "3 windows still open",
        increase: true,
    },
    {
        label: "Avg. intake time",
        value: "2m 40s",
        change: "22s vs last week",
        increase: false,
    },
    {
        label: "Completion rate",
        value: "65%",
        change: "3 pts — tag photo step",
        increase: false,
    },
];

const Overview = () => {
    const session = useValidatedSession();
    const today = new Date();

    return (
        <PageLayout
            title={`${greetingByTimeOfDay()}, ${session.user.first_name}`}
            subtitle={today.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
            })}
        >
            <Grid
                container
                columns={1}
                spacing={{ xs: 2, md: 3 }}
                sx={{ width: "100%" }}
            >
                <Grid size={1}>
                    {/* One KPI per row on phones, two up on tablets, four
                        across on wide screens. `size={1}` stays put; only the
                        container's track count changes. */}
                    <Grid
                        container
                        spacing={2}
                        columns={{ xs: 1, sm: 2, lg: 4 }}
                        sx={{ width: "100%" }}
                    >
                        {STATS.map((s) => {
                            return (
                                <Grid size={1} key={s.label}>
                                    <CardContainer>
                                        <Typography variant="label">
                                            {s.label}
                                        </Typography>
                                        <Typography variant="statValue">
                                            {s.value}
                                        </Typography>
                                        <Typography
                                            color={
                                                s.increase ? "success" : "error"
                                            }
                                            variant="label"
                                        >
                                            {s.increase ? "↑" : "↓"}
                                            {s.change}
                                        </Typography>
                                    </CardContainer>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Grid>

                <Grid size={1}>
                    {/* The 7/5 split only survives at md+; below that the
                        chart and funnel each take a full row. */}
                    <Grid container spacing={2} sx={{ width: "100%" }}>
                        <Grid size={{ xs: 12, md: 7 }}>
                            <CardContainer
                                title="Bookings this Week"
                                subtitle="Completed intake flows"
                            >
                                <DayOfWeekBarGraph
                                    data={[
                                        { dayOfWeekIndex: 0, count: 9 },
                                        { dayOfWeekIndex: 1, count: 11 },
                                        { dayOfWeekIndex: 2, count: 8 },
                                        { dayOfWeekIndex: 3, count: 12 },
                                        { dayOfWeekIndex: 4, count: 0 },
                                        { dayOfWeekIndex: 5, count: 0 },
                                        { dayOfWeekIndex: 6, count: 0 },
                                    ]}
                                />
                            </CardContainer>
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <CardContainer
                                title="Intake Funnel · 7 day"
                                subtitle="Biggest drop-off: model tag photo step."
                            >
                                <IntakeFunnel />
                            </CardContainer>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid size={1}>
                    <CardContainer
                        title="Today's Jobs"
                        subtitle="5 scheduled · 3 windows still open"
                    >
                        <TodayJobs />
                    </CardContainer>
                </Grid>
            </Grid>
        </PageLayout>
    );
};

export default Overview;
