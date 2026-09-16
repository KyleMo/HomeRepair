"use client";

import {
    AppBar,
    Avatar,
    Box,
    Button,
    Divider,
    Drawer,
    IconButton,
    ListItem,
    Select,
    Stack,
    Toolbar,
    Typography,
} from "@mui/material";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Company } from "@homerepair/data";
import { OrganizationWithCompanies } from "@/types/organization";
import { useValidatedSession } from "@/hooks";
import { useEffect, useState } from "react";

/** Shared by the desktop rail and the mobile drawer so they can't drift. */
const NAV_WIDTH = 225;

const NAV_ITEMS = [
    {
        href: "/overview",
        label: "Overview",
        activeIcon: <GridViewRoundedIcon />,
        icon: <GridViewOutlinedIcon />,
    },
    {
        href: "/bookings",
        label: "Bookings",
        activeIcon: <CalendarTodayRoundedIcon />,
        icon: <CalendarTodayOutlinedIcon />,
    },
    // {
    //     href: "/schedule",
    //     label: "Schedule",
    //     activeIcon: <AccessTimeFilledRoundedIcon />,
    //     icon: <AccessTimeOutlinedIcon />,
    // },
    // { href: "/analytics", label: "Analytics", icon: <EqualizerRoundedIcon /> },
    // {
    //     href: "/customers",
    //     label: "Customers",
    //     icon: <PersonOutlineOutlinedIcon />,
    // },
    {
        href: "/settings",
        label: "Settings",
        activeIcon: <SettingsIcon />,
        icon: <SettingsOutlinedIcon />,
    },
];

type NavProps = {
    organizations: OrganizationWithCompanies[];
};

const MultiOrgInput = (input: {
    organizations: OrganizationWithCompanies[];
}) => {
    return (
        <Select>
            {input.organizations.map((org) => {
                return <ListItem key={org.id}>{org.name}</ListItem>;
            })}
        </Select>
    );
};

const SingleOrgDisplay = ({
    organization,
    company,
}: {
    organization: OrganizationWithCompanies;
    company?: Company;
}) => {
    if (company) {
        return (
            <>
                <Typography
                    noWrap
                    sx={{ fontSize: 16, fontWeight: 700 }}
                    variant="h1"
                >
                    {company.name}
                </Typography>
                <Typography variant="body1" sx={{ fontSize: 12 }}>
                    Company
                </Typography>
            </>
        );
    }
    return (
        <>
            <Typography
                noWrap
                sx={{ fontSize: 16, fontWeight: 700 }}
                variant="h1"
            >
                {organization.name}
            </Typography>
            <Typography variant="body1" sx={{ fontSize: 12 }}>
                Organization
            </Typography>
        </>
    );
};

/**
 * The nav's contents, rendered twice: once in the always-on desktop rail and
 * once inside the mobile drawer. Keeping it in one place means a nav item only
 * ever has to be added once.
 */
const NavContent = ({
    organizations,
    onNavigate,
}: NavProps & { onNavigate?: () => void }) => {
    const session = useValidatedSession();
    const pathname = usePathname();

    const isMultiOrgs = organizations.length >= 2;
    const verifiedOrg = organizations[0];

    let firstLetter = session.user.first_name[0];
    let secondLetter = session.user.last_name[0];

    return (
        <Stack sx={{ height: "100%" }} spacing={2}>
            <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
                <Avatar alt={session.user.first_name}>
                    <Typography>RA</Typography>
                </Avatar>
                <Stack sx={{ minWidth: 0 }}>
                    {isMultiOrgs ? (
                        <MultiOrgInput organizations={organizations} />
                    ) : verifiedOrg ? (
                        <SingleOrgDisplay
                            organization={verifiedOrg}
                            company={
                                verifiedOrg.companies.length === 1
                                    ? verifiedOrg.companies[0]
                                    : undefined
                            }
                        />
                    ) : (
                        <h3>No org found</h3>
                    )}
                </Stack>
            </Stack>
            <Stack spacing={1} sx={{ alignItems: "start", flexGrow: 1 }}>
                {NAV_ITEMS.map(({ href, label, icon, activeIcon }) => {
                    const active = pathname === href;
                    return (
                        <Button
                            variant="text"
                            key={href}
                            component={Link}
                            href={href}
                            onClick={onNavigate}
                            startIcon={active ? activeIcon : icon}
                            fullWidth
                            sx={{
                                paddingLeft: 2,
                                paddingRight: 2,
                                paddingTop: 1,
                                paddingBottom: 1,
                                justifyContent: "flex-start", // ← left-aligns all of them
                                color: active
                                    ? "primary.dark"
                                    : "text.secondary",
                                bgcolor: active
                                    ? "primary.light"
                                    : "transparent",
                                fontWeight: active ? 600 : 500,
                            }}
                        >
                            {label}
                        </Button>
                    );
                })}
            </Stack>
            <Box>
                <Divider sx={{ marginBottom: 2 }} />
                <Stack
                    direction="row"
                    sx={{ alignItems: "center" }}
                    spacing={1}
                >
                    <Avatar
                        alt={
                            session.user.first_name +
                            " " +
                            session.user.last_name
                        }
                    >
                        <Typography>
                            {firstLetter}
                            {secondLetter ? ` ${secondLetter}` : ""}
                        </Typography>
                    </Avatar>
                    <Stack sx={{ minWidth: 0 }}>
                        <Typography variant="h2" noWrap>
                            {session.user.name}
                        </Typography>
                        <Typography>Owner</Typography>
                    </Stack>
                </Stack>
            </Box>
        </Stack>
    );
};

const Nav = ({ organizations }: NavProps) => {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const org = organizations[0];
    const headerName =
        (org?.companies.length === 1 ? org.companies[0]?.name : org?.name) ??
        "Console";

    // Tapping a nav item navigates but leaves the drawer covering the page it
    // just opened, so dismiss it whenever the route changes.
    useEffect(() => setOpen(false), [pathname]);

    return (
        <>
            {/* Phone/tablet: a top bar owning the menu affordance. */}
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    // flex, not block: AppBar's own root relies on it.
                    display: { xs: "flex", md: "none" },
                    backgroundColor: "#FFFFFF",
                    color: "text.primary",
                    borderBottom: 1,
                    borderColor: "divider",
                }}
            >
                <Toolbar variant="dense" sx={{ gap: 1 }}>
                    <IconButton
                        edge="start"
                        onClick={() => setOpen(true)}
                        aria-label="Open navigation"
                        aria-expanded={open}
                    >
                        <MenuRoundedIcon />
                    </IconButton>
                    <Typography sx={{ fontWeight: 700, minWidth: 0 }} noWrap>
                        {headerName}
                    </Typography>
                </Toolbar>
            </AppBar>

            <Drawer
                open={open}
                onClose={() => setOpen(false)}
                // keepMounted: the drawer's contents stay in the DOM so the
                // first open doesn't pay a mount cost mid-animation.
                ModalProps={{ keepMounted: true }}
                sx={{ display: { xs: "block", md: "none" } }}
                slotProps={{
                    paper: {
                        sx: { width: NAV_WIDTH, padding: 2 },
                    },
                }}
            >
                <NavContent
                    organizations={organizations}
                    onNavigate={() => setOpen(false)}
                />
            </Drawer>

            {/* Desktop: the rail, unchanged. */}
            <Box
                component="nav"
                sx={{
                    display: { xs: "none", md: "block" },
                    padding: 2,
                    borderRight: 2,
                    borderColor: "divider",
                    width: NAV_WIDTH,
                    flexShrink: 0,
                    backgroundColor: "#FFFFFF",
                    position: "sticky",
                    top: 0,
                    alignSelf: "flex-start",
                    height: "100vh",
                }}
            >
                <NavContent organizations={organizations} />
            </Box>
        </>
    );
};

export default Nav;
