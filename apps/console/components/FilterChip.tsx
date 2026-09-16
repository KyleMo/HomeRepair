"use client";

import Chip, { type ChipProps } from "@mui/material/Chip";

export interface FilterChipProps extends Omit<ChipProps, "color" | "variant"> {
    /** Applies the selected treatment (secondary fill + primary outline). */
    selected?: boolean;
}

/**
 * Selectable pill used for filter rows and section nav (Bookings filters,
 * Settings sections).
 *
 * MUI's Chip has no `selected` prop, and `color`/`variant` can't express this
 * pairing — the theme's MuiChip variants pin a grey fill on `color="default"`
 * and `variant="filled"` on primary gives a solid green. So both states are
 * driven off `selected` against theme tokens:
 *
 *   unselected -> background.paper fill, divider outline
 *   selected   -> secondary.main fill, primary.main outline, primary.dark text
 *
 * Status chips (BookingCard, TodayJobs) intentionally keep using MUI's Chip
 * directly, since those are read-only and colour-coded by status.
 */
const FilterChip = ({ selected = false, sx, ...props }: FilterChipProps) => {
    return (
        <Chip
            clickable
            aria-pressed={selected}
            sx={[
                (theme) => ({
                    height: 40,
                    fontSize: 15,
                    fontWeight: selected ? 700 : 650,
                    border: "1px solid",
                    borderColor: selected
                        ? theme.palette.primary.main
                        : theme.palette.divider,
                    color: selected
                        ? theme.palette.secondary.contrastText
                        : theme.palette.text.primary,
                    backgroundColor: selected
                        ? theme.palette.secondary.main
                        : theme.palette.background.paper,
                    "& .MuiChip-label": { px: 2.25 },
                    // Chip's own hover rule would otherwise repaint the fill.
                    "&:hover": {
                        backgroundColor: selected
                            ? theme.palette.secondary.light
                            : theme.palette.background.default,
                    },
                }),
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...props}
        />
    );
};

export default FilterChip;
