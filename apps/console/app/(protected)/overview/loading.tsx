import CardContainer from "@/components/CardContainer";
import { Box, Grid, Skeleton, Stack } from "@mui/material";

/**
 * Placeholder for the header CardContainer normally renders from `title` /
 * `subtitle`. The cards here are rendered untitled so the skeleton owns those
 * two lines instead of showing real copy against fake content.
 */
const HeadingSkeleton = () => {
    return (
        <Box sx={{ marginBottom: 2 }}>
            <Skeleton variant="text" width={180} height={22} />
            <Skeleton variant="text" width={240} height={18} />
        </Box>
    );
};

const StatCardSkeleton = () => {
    return (
        <CardContainer>
            <Skeleton variant="text" width="65%" height={20} />
            {/* Matches the statValue line, which is the tallest row in the card. */}
            <Skeleton variant="text" width="45%" height={44} />
            <Skeleton variant="text" width="75%" height={18} />
        </CardContainer>
    );
};

const OverviewLoading = () => {
    return (
        <Box>
            {/* Mirrors PageLayout's header row: title block left, filter and
                action right. Hand-rolled rather than reusing PageLayout, which
                reads live org data from context to build its company filter. */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                    justifyContent: "space-between",
                    alignItems: { xs: "stretch", sm: "center" },
                    marginBottom: 3,
                }}
            >
                <Box>
                    <Skeleton variant="text" width={280} height={40} />
                    <Skeleton variant="text" width={200} height={20} />
                </Box>
                <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: "center" }}
                >
                    <Skeleton
                        variant="rounded"
                        height={40}
                        sx={{ width: { xs: "100%", sm: 180 }, borderRadius: 2 }}
                    />
                    <Skeleton
                        variant="rounded"
                        width={130}
                        height={40}
                        sx={{ flexShrink: 0, borderRadius: 2.5 }}
                    />
                </Stack>
            </Stack>

            <Grid
                container
                columns={1}
                spacing={{ xs: 2, md: 3 }}
                sx={{ width: "100%" }}
            >
                <Grid size={1}>
                    <Grid
                        container
                        spacing={2}
                        columns={{ xs: 1, sm: 2, lg: 4 }}
                        sx={{ width: "100%" }}
                    >
                        {[0, 1, 2, 3].map((index) => (
                            <Grid size={1} key={index}>
                                <StatCardSkeleton />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>

                <Grid size={1}>
                    <Grid container spacing={2} sx={{ width: "100%" }}>
                        <Grid size={{ xs: 12, md: 7 }}>
                            <CardContainer>
                                <HeadingSkeleton />
                                {/* Same height as DayOfWeekBarGraph's plot area,
                                    so the card doesn't resize on swap. */}
                                <Skeleton
                                    variant="rounded"
                                    sx={{
                                        width: "100%",
                                        height: { xs: 160, sm: 200 },
                                        marginTop: 2,
                                    }}
                                />
                            </CardContainer>
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <CardContainer>
                                <HeadingSkeleton />
                                <Stack spacing={2} sx={{ marginTop: 2 }}>
                                    {[0, 1, 2, 3].map((index) => (
                                        <Stack spacing={0.75} key={index}>
                                            <Stack
                                                direction="row"
                                                sx={{
                                                    justifyContent:
                                                        "space-between",
                                                }}
                                            >
                                                <Skeleton
                                                    variant="text"
                                                    width={130}
                                                    height={18}
                                                />
                                                <Skeleton
                                                    variant="text"
                                                    width={28}
                                                    height={18}
                                                />
                                            </Stack>
                                            <Skeleton
                                                variant="rounded"
                                                height={8}
                                                sx={{ width: "100%" }}
                                            />
                                        </Stack>
                                    ))}
                                </Stack>
                            </CardContainer>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid size={1}>
                    <CardContainer>
                        <HeadingSkeleton />
                        <Stack>
                            {[0, 1, 2, 3, 4].map((index) => (
                                <Grid
                                    container
                                    spacing={1}
                                    key={index}
                                    sx={{
                                        alignItems: "center",
                                        paddingY: 1.5,
                                        borderTop:
                                            index === 0 ? "none" : "1px solid",
                                        borderColor: "divider",
                                    }}
                                >
                                    <Grid size={{ xs: 4, sm: 2 }}>
                                        <Skeleton
                                            variant="text"
                                            width="70%"
                                            height={20}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 8, sm: 3 }}>
                                        <Skeleton
                                            variant="text"
                                            width="80%"
                                            height={20}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Skeleton
                                            variant="text"
                                            width="90%"
                                            height={20}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 2 }}>
                                        <Skeleton
                                            variant="text"
                                            width="60%"
                                            height={20}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 1 }}>
                                        <Skeleton
                                            variant="rounded"
                                            height={24}
                                            sx={{
                                                width: 72,
                                                borderRadius: 999,
                                                marginLeft: "auto",
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            ))}
                        </Stack>
                    </CardContainer>
                </Grid>
            </Grid>
        </Box>
    );
};

export default OverviewLoading;
