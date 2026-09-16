"use client";
import { useOrganizations } from "@/hooks";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import {
    Box,
    Stack,
    Typography,
    Select,
    MenuItem,
    Button,
    LinearProgress,
} from "@mui/material";
import { timezoneAbbreviation } from "@homerepair/utility/client";
import { PropsWithChildren } from "react";

type PageLayoutProps = {
    title: string;
    subtitle?: string;
    timezone?: string;
    actionsSlot?: React.ReactElement;
    /** Shows the page-top progress bar while a page fetches. */
    isLoading?: boolean;
};

/** Thin enough to read as a hairline over the nav rather than a banner. */
const PROGRESS_HEIGHT = 4;

const PageLayout = ({
    title,
    subtitle,
    actionsSlot,
    isLoading = false,
    children,
}: PropsWithChildren<PageLayoutProps>) => {
    const { companyFilter, setCompanyFilter, organizations, currentTimezone } =
        useOrganizations();

    return (
        <Box>
            {isLoading && (
                <LinearProgress
                    aria-label="Loading page content"
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: (theme) => theme.zIndex.drawer + 2,
                        "@keyframes pageLoadingPulse": {
                            "0%, 100%": { opacity: 1 },
                            "50%": { opacity: 0.45 },
                        },
                        animation: "pageLoadingPulse 1.4s ease-in-out infinite",
                        height: PROGRESS_HEIGHT,
                        backgroundColor: "primary.light",
                        // Leaves a static bar rather than a strobing one for
                        // anyone who has asked the OS to cut animation.
                        "@media (prefers-reduced-motion: reduce)": {
                            animation: "none",
                        },
                    }}
                />
            )}

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
                    <Typography variant="h1" sx={{ fontWeight: 700 }}>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="label">{subtitle}</Typography>
                    )}
                </Box>

                <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                        alignItems: "center",
                    }}
                >
                    <Stack
                        direction="row"
                        sx={{
                            display: { xs: "none", md: "flex" },
                            alignItems: "center",
                            gap: 0.75,
                            flexShrink: 0,
                            paddingX: 1.5,
                            paddingY: 0.75,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            backgroundColor: "background.paper",
                        }}
                    >
                        <ScheduleOutlinedIcon
                            sx={{ fontSize: 17, color: "text.secondary" }}
                        />
                        <Typography
                            variant="label"
                            noWrap
                            sx={{ fontSize: 13.5, fontWeight: 600 }}
                        >
                            Times in{" "}
                            <Box
                                component="span"
                                sx={{ fontWeight: 700, color: "text.primary" }}
                            >
                                {timezoneAbbreviation(currentTimezone)}
                            </Box>
                        </Typography>
                    </Stack>

                    <Select
                        startAdornment={<FilterAltOutlinedIcon />}
                        value={companyFilter}
                        onChange={(e) => setCompanyFilter(e.target.value)}
                        size="small"
                        sx={{
                            backgroundColor: "#FFFFFF",
                            flexGrow: { xs: 1, sm: 0 },
                        }}
                    >
                        <MenuItem value="all">All Companies</MenuItem>
                        {organizations
                            .flatMap((org) => org.companies)
                            .map((c) => {
                                return (
                                    <MenuItem value={c.id} key={c.id}>
                                        {c.name}
                                    </MenuItem>
                                );
                            })}
                    </Select>
                    {actionsSlot ? (
                        actionsSlot
                    ) : (
                        <Button variant="contained" sx={{ flexShrink: 0 }}>
                            New Booking
                        </Button>
                    )}
                </Stack>
            </Stack>

            {children}
        </Box>
    );
};

export default PageLayout;
