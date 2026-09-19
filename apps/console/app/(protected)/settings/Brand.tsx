"use client";

import CardContainer from "@/components/CardContainer";
import {
    MAX_CORNER_RADIUS,
    MIN_CORNER_RADIUS,
    type BrandSettings,
    type CompanyIdentity,
} from "@/types/setting";
import { normalizeHex, debounce } from "@homerepair/utility";
import {
    alpha,
    Box,
    ButtonBase,
    Grid,
    InputAdornment,
    LinearProgress,
    Popover,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";

/** The colour columns of company_brand_settings, in the order they're shown. */
type ColorId =
    | "primary_color"
    | "secondary_color"
    | "selected_fill"
    | "selected_text"
    | "body_text"
    | "button_text"
    | "page_background";

type ColorSelect = {
    id: ColorId;
    label: string;
    description: string;
};

type BrandColors = Pick<BrandSettings, ColorId>;

const COLOR_SELECTS: ColorSelect[] = [
    {
        id: "primary_color",
        label: "Primary",
        description: "Buttons, progress bar, links",
    },
    {
        id: "secondary_color",
        label: "Secondary",
        description: "Accents and secondary marks",
    },
    {
        id: "selected_fill",
        label: "Selected Fill",
        description: "Chips and cards when chosen",
    },
    {
        id: "selected_text",
        label: "Selected Text",
        description: "Label color inside selections",
    },
    {
        id: "body_text",
        label: "Body Text",
        description: "Headings and paragraph copy",
    },
    {
        id: "button_text",
        label: "Button Text",
        description: "Label on primary buttons",
    },
    {
        id: "page_background",
        label: "Page Background",
        description: "Portal canvas behind content",
    },
];

type ColorRowProps = {
    color: ColorSelect;
    value: string;
    onChange: (hex: string) => void;
};

const ColorRow = ({ color, value, onChange }: ColorRowProps) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    // The text field is edited as free text and only committed on blur/Enter,
    // so a half-typed "#0F6E" never lands in state as a broken colour.
    const [draft, setDraft] = useState(value);

    useEffect(() => setDraft(value), [value]);

    const commit = () => {
        const next = normalizeHex(draft);
        next ? onChange(next) : setDraft(value);
    };

    return (
        <Stack
            direction="row"
            sx={{
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                paddingY: 1.25,
                borderBottom: "1px solid",
                borderColor: "divider",
                "&:last-of-type": { borderBottom: "none", paddingBottom: 0 },
            }}
        >
            <Stack
                direction="row"
                sx={{ alignItems: "center", gap: 1.5, minWidth: 0 }}
            >
                <ButtonBase
                    aria-label={`Change ${color.label} colour`}
                    onClick={(event) => setAnchorEl(event.currentTarget)}
                    sx={{
                        width: 40,
                        height: 40,
                        flexShrink: 0,
                        backgroundColor: value,
                        borderRadius: 0.5,
                        border: "1px solid",
                        borderColor: "divider",
                        "&:hover": { boxShadow: 2 },
                    }}
                />
                <Stack sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 650 }} noWrap>
                        {color.label}
                    </Typography>
                    <Typography
                        variant="label"
                        sx={{ fontSize: 12.5, fontWeight: 500 }}
                        noWrap
                    >
                        {color.description}
                    </Typography>
                </Stack>
            </Stack>

            <TextField
                size="small"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onBlur={commit}
                onKeyDown={(event) => event.key === "Enter" && commit()}
                sx={{ width: 116, flexShrink: 0 }}
                slotProps={{
                    htmlInput: {
                        "aria-label": `${color.label} hex value`,
                        spellCheck: false,
                        style: {
                            fontFamily:
                                "ui-monospace, SFMono-Regular, monospace",
                            fontSize: 13,
                            textTransform: "uppercase",
                        },
                    },
                }}
            />

            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                slotProps={{ paper: { sx: { padding: 1.5 } } }}
            >
                <HexColorPicker
                    color={value}
                    onChange={debounce(onChange, 100)}
                />
            </Popover>
        </Stack>
    );
};

const PREVIEW_OPTIONS = [
    "Refrigerator not cooling",
    "Dishwasher won't drain",
    "Oven won't heat",
];

type PortalPreviewProps = {
    colors: BrandColors;
    businessName: string;
    radius: number;
};

const PortalPreview = ({
    colors,
    businessName,
    radius,
}: PortalPreviewProps) => {
    const innerRadius = `${Math.min(radius, 12)}px`;

    return (
        <Stack
            sx={{
                gap: 1.75,
                padding: 2,
                pointerEvents: "none",
                userSelect: "none",
                borderRadius: `${radius}px`,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: colors.page_background,
            }}
        >
            <Stack
                direction="row"
                sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                }}
            >
                <Typography
                    sx={{ fontWeight: 700, color: colors.body_text }}
                    noWrap
                >
                    {businessName || "Your business"}
                </Typography>
            </Stack>

            <LinearProgress
                variant="determinate"
                value={40}
                sx={{
                    height: 8,
                    backgroundColor: colors.selected_fill,
                    "& .MuiLinearProgress-bar": {
                        backgroundColor: colors.primary_color,
                    },
                }}
            />

            <Typography
                sx={{ fontWeight: 700, fontSize: 17, color: colors.body_text }}
            >
                What needs fixing?
            </Typography>

            <Stack sx={{ gap: 1 }}>
                {PREVIEW_OPTIONS.map((option, index) => {
                    const selected = index === 0;

                    return (
                        <Stack
                            key={option}
                            direction="row"
                            sx={{
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 1,
                                padding: 1.25,
                                borderRadius: innerRadius,
                                border: "1px solid",
                                borderColor: selected
                                    ? colors.primary_color
                                    : alpha(colors.body_text, 0.15),
                                backgroundColor: selected
                                    ? colors.selected_fill
                                    : "#FFFFFF",
                                color: selected
                                    ? colors.selected_text
                                    : colors.body_text,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: 14,
                                    fontWeight: selected ? 700 : 500,
                                    color: "inherit",
                                }}
                                noWrap
                            >
                                {option}
                            </Typography>
                            {selected && (
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        flexShrink: 0,
                                        borderRadius: "50%",
                                        backgroundColor: colors.primary_color,
                                    }}
                                />
                            )}
                        </Stack>
                    );
                })}
            </Stack>

            <Box
                sx={{
                    alignSelf: "flex-start",
                    paddingX: 1.25,
                    paddingY: 0.25,
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    backgroundColor: colors.secondary_color,
                    color: colors.selected_text,
                }}
            >
                Soonest visit · today 4–6pm
            </Box>

            <Box
                sx={{
                    padding: 1.25,
                    borderRadius: innerRadius,
                    textAlign: "center",
                    fontSize: 15,
                    fontWeight: 650,
                    backgroundColor: colors.primary_color,
                    color: colors.button_text,
                }}
            >
                Continue
            </Box>
        </Stack>
    );
};

type BrandProps = {
    company: CompanyIdentity;
    brand: BrandSettings;
    onCompanyChange: (patch: Partial<CompanyIdentity>) => void;
    onBrandChange: (patch: Partial<BrandSettings>) => void;
};

const Brand = ({
    company,
    brand,
    onCompanyChange,
    onBrandChange,
}: BrandProps) => {
    const radius = brand.corner_radius;

    return (
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ width: "100%" }}>
            <Grid size={{ xs: 12, lg: 7 }}>
                <Stack sx={{ gap: { xs: 2, md: 3 } }}>
                    <CardContainer
                        title="Brand Colors"
                        subtitle="These drive every button, selected state, and progress bar in your customer booking portal."
                    >
                        <Stack>
                            {COLOR_SELECTS.map((cs) => {
                                return (
                                    <ColorRow
                                        key={cs.id}
                                        color={cs}
                                        value={brand[cs.id]}
                                        onChange={(hex) =>
                                            onBrandChange({
                                                [cs.id]: hex.toUpperCase(),
                                            })
                                        }
                                    />
                                );
                            })}
                        </Stack>
                    </CardContainer>

                    <CardContainer
                        title="Business identity"
                        subtitle="Shown in the portal header and on booking confirmations."
                    >
                        <Stack sx={{ gap: 2 }}>
                            <TextField
                                size="small"
                                fullWidth
                                label="Business name"
                                value={company.name}
                                onChange={(event) =>
                                    onCompanyChange({
                                        name: event.target.value,
                                    })
                                }
                            />
                            <TextField
                                size="small"
                                fullWidth
                                label="Phone number"
                                value={company.phone ?? ""}
                                onChange={(event) =>
                                    onCompanyChange({
                                        // An emptied field means "no phone",
                                        // which is what the column stores.
                                        phone: event.target.value || null,
                                    })
                                }
                            />
                            <TextField
                                size="small"
                                label="Corner radius"
                                type="number"
                                value={radius}
                                onChange={(event) =>
                                    onBrandChange({
                                        corner_radius: Math.min(
                                            MAX_CORNER_RADIUS,
                                            Math.max(
                                                MIN_CORNER_RADIUS,
                                                Number(event.target.value) || 0,
                                            ),
                                        ),
                                    })
                                }
                                helperText={`${MIN_CORNER_RADIUS}–${MAX_CORNER_RADIUS}px. Applies to cards, inputs, and buttons.`}
                                sx={{ width: { xs: "100%", sm: 200 } }}
                                slotProps={{
                                    htmlInput: {
                                        min: MIN_CORNER_RADIUS,
                                        max: MAX_CORNER_RADIUS,
                                    },
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                px
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Stack>
                    </CardContainer>
                </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
                <CardContainer
                    title="Customer Portal Preview"
                    subtitle="Updates as you edit — nothing here is live until you save."
                >
                    <Box>
                        <PortalPreview
                            colors={brand}
                            businessName={company.name}
                            radius={radius}
                        />
                    </Box>
                </CardContainer>
            </Grid>
        </Grid>
    );
};

export default Brand;
