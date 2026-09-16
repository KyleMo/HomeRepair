"use client";

import { alpha, createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import type { CSSProperties, ReactNode } from "react";

// --- Custom theme augmentation ------------------------------------------------
// Adds `statValue`/`label` typography variants and a `chartMuted` palette token
// so they are type-safe to use (e.g. <Typography variant="statValue" />).
declare module "@mui/material/styles" {
    interface TypographyVariants {
        statValue: CSSProperties;
        label: CSSProperties;
    }
    interface TypographyVariantsOptions {
        statValue?: CSSProperties;
        label?: CSSProperties;
    }
    interface Palette {
        chartMuted: string;
    }
    interface PaletteOptions {
        chartMuted?: string;
    }
}
declare module "@mui/material/Typography" {
    interface TypographyPropsVariantOverrides {
        statValue: true;
        label: true;
    }
}

// --- Design tokens ------------------------------------------------------------
const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#0F6E56",
            light: "#E1F5EE", // selected/hover backgrounds
            dark: "#085041", // selected text
            contrastText: "#FFFFFF",
        },
        // The fill behind a selected pill (see components/FilterChip.tsx).
        // Deliberately a pale tint rather than a saturated hue — `main` is the
        // background and `contrastText` the label that sits on it.
        secondary: {
            main: "#E1F5EE",
            light: "#EFFAF6",
            dark: "#085041",
            contrastText: "#085041",
        },
        // Reuses the primary light/dark pairing per the spec.
        success: {
            main: "#0F6E56",
            light: "#E1F5EE",
            dark: "#085041",
            contrastText: "#FFFFFF",
        },
        warning: {
            main: "#9A5B1F",
            light: "#FFF3E0", // chip background
            dark: "#9A5B1F", // chip text
            contrastText: "#FFFFFF",
        },
        error: {
            main: "#B4552D",
            contrastText: "#FFFFFF",
        },
        background: {
            default: "#F5F7F6",
            paper: "#FFFFFF",
        },
        text: {
            primary: "#12201C",
            secondary: "#6B7A75",
            disabled: "#8CA39B",
        },
        divider: "#E5EAE8",
        chartMuted: "#BFE2D6",
    },

    shape: {
        borderRadius: 14,
    },

    typography: {
        // Font FAMILY is intentionally deferred to next/font: it sets the family on
        // <body>, and `inherit` lets every MUI component pick it up. Swap this for
        // `var(--your-font-variable)` if you'd rather bind it explicitly.
        fontFamily: "inherit",
        h1: { fontSize: "24px", fontWeight: 700, letterSpacing: "-0.3px" },
        h2: { fontSize: "15.5px", fontWeight: 700 },
        body1: { fontSize: "14px", fontWeight: 400 },
        body2: { fontSize: "13px", fontWeight: 400 },
        button: { fontWeight: 650, textTransform: "none" },
        statValue: {
            fontSize: "26px",
            fontWeight: 700,
            letterSpacing: "-0.5px",
        },
        // Muted caption sitting above a statValue / form control. Colour is
        // inlined rather than read off the palette because `typography` is
        // evaluated before it — keep in sync with palette.text.secondary.
        label: {
            fontSize: "14px",
            fontWeight: 700,
            lineHeight: 1.4,
            color: "#6B7A75",
        },
    },

    components: {
        // Map the custom variant onto a block-level element.
        MuiTypography: {
            defaultProps: {
                variantMapping: { statValue: "p", label: "p" },
            },
        },

        // Flat cards: white paper, 1px divider border, 14px radius, no shadow.
        MuiCard: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: ({ theme }) => ({
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 14,
                    backgroundImage: "none",
                }),
            },
        },
        MuiPaper: {
            styleOverrides: {
                // Remove MUI's elevation gradient overlay so paper stays pure white.
                root: { backgroundImage: "none" },
            },
        },

        // Buttons: 10px radius, heavier weight, no shadow, darken on press.
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    fontWeight: 650,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:active": { filter: "brightness(0.92)" },
                },
            },
            variants: [
                {
                    // Text buttons (e.g. nav items) get an obvious primary-tinted
                    // hover instead of MUI's near-invisible ~4% overlay.
                    props: { variant: "text" },
                    style: ({ theme }) => ({
                        "&:hover": {
                            backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.1,
                            ),
                        },
                    }),
                },
            ],
        },

        // Status chips: 999px pills with per-status bg/text pairs.
        //   success -> done      | warning -> in-progress | default -> scheduled/neutral
        MuiChip: {
            styleOverrides: {
                root: { borderRadius: 999, fontWeight: 600 },
            },
            variants: [
                {
                    props: { color: "success" },
                    style: { backgroundColor: "#E1F5EE", color: "#085041" },
                },
                {
                    props: { color: "warning" },
                    style: { backgroundColor: "#FFF3E0", color: "#9A5B1F" },
                },
                {
                    props: { color: "default" },
                    style: { backgroundColor: "#EDF1EF", color: "#3C4844" },
                },
            ],
        },

        // Inputs default to a 400-weight value, which reads lighter than the
        // 650-weight labels sitting beside them in settings cards. Covers
        // Select too, since its rendered value carries the InputBase classes.
        MuiInputBase: {
            styleOverrides: {
                input: { fontWeight: 600 },
            },
        },
        MuiSelect: {
            styleOverrides: {
                select: { fontWeight: 600 },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: { fontWeight: 600 },
            },
        },

        // Progress bars as pills.
        MuiLinearProgress: {
            styleOverrides: {
                root: { borderRadius: 999 },
                bar: { borderRadius: 999 },
            },
        },
    },
});

export default function MaterialUiThemeProvider({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <ThemeProvider theme={theme}>
            {/* Applies background.default, resets, and baseline typography. */}
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}
