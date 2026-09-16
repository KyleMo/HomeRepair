"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
    alpha,
    Box,
    Card,
    Collapse,
    Stack,
    Typography,
    styled,
} from "@mui/material";
import { useState, type PropsWithChildren } from "react";

const CardSurface = styled(Card)(({ theme }) => ({
    padding: theme.spacing(1.5),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.5),
    [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(2),
        width: "100%",
    },
}));

type CardContainerProps = {
    title?: string;
    subtitle?: string;
    /** Collapses the children behind a header toggle. */
    expandable?: boolean;
    /** Starting state when `expandable` — ignored otherwise. */
    defaultExpanded?: boolean;
    /** Display title / subtitle row or column */
    displayRow?: boolean;
};

const CardContainer = ({
    title,
    subtitle,
    expandable = false,
    defaultExpanded = false,
    displayRow = false,
    children,
}: PropsWithChildren<CardContainerProps>) => {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const toggle = () => setExpanded((current) => !current);

    if (!title) {
        return <CardSurface>{children}</CardSurface>;
    }

    const heading = (
        <Stack
            direction={displayRow ? "row" : "column"}
            sx={{
                alignItems: displayRow ? "center" : "flex-start",
                gap: displayRow ? 1 : 0,
                marginBottom: 2,
            }}
        >
            <Typography variant="label" sx={{ color: "#000000", fontSize: 15 }}>
                {title}
            </Typography>
            {subtitle && <Typography variant="caption">{subtitle}</Typography>}
        </Stack>
    );

    if (!expandable) {
        return (
            <CardSurface>
                <Box sx={{ width: "100%", minWidth: 0 }}>
                    {heading}
                    {children}
                </Box>
            </CardSurface>
        );
    }

    return (
        <CardSurface
            onClick={toggle}
            sx={(theme) => ({
                cursor: "pointer",
                transition: theme.transitions.create(
                    ["border-color", "box-shadow"],
                    { duration: theme.transitions.duration.shortest },
                ),
                // Cards are flat by design (divider border, no elevation), so
                // hover just firms up the border with a whisper of shadow.
                "&:hover": {
                    borderColor: alpha(theme.palette.text.primary, 0.24),
                    boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.06)}`,
                },
            })}
        >
            <Box sx={{ width: "100%", minWidth: 0 }}>
                <Stack
                    direction="row"
                    sx={{
                        width: "100%",
                        gap: 1,
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>{heading}</Box>

                    <ExpandMoreIcon
                        sx={{
                            flexShrink: 0,
                            color: "text.secondary",
                            transition: (theme) =>
                                theme.transitions.create("transform", {
                                    duration:
                                        theme.transitions.duration.shortest,
                                }),
                            transform: expanded
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                        }}
                    />
                </Stack>

                <Collapse
                    in={expanded}
                    timeout="auto"
                    onClick={(event) => event.stopPropagation()}
                    sx={{ cursor: "auto" }}
                >
                    {children}
                </Collapse>
            </Box>
        </CardSurface>
    );
};

export default CardContainer;
