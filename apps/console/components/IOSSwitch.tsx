import { Switch, SwitchProps, alpha, styled } from "@mui/material";

/**
 * iOS-style toggle, painted from the theme rather than Apple's palette:
 * primary green when on, divider grey when off, white thumb throughout.
 */
const IOSSwitch = styled((props: SwitchProps) => (
    <Switch
        focusVisibleClassName=".Mui-focusVisible"
        disableRipple
        {...props}
    />
))(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    "& .MuiSwitch-switchBase": {
        padding: 0,
        margin: 2,
        transitionDuration: "300ms",
        "&.Mui-checked": {
            transform: "translateX(16px)",
            color: theme.palette.primary.contrastText,
            "& + .MuiSwitch-track": {
                backgroundColor: theme.palette.primary.main,
                opacity: 1,
                border: 0,
            },
            "&.Mui-disabled + .MuiSwitch-track": {
                opacity: 0.5,
            },
        },
        // A focus ring around the thumb, rather than the demo's white border,
        // which repainted the thumb and made it look a size smaller.
        "&.Mui-focusVisible .MuiSwitch-thumb": {
            boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.25)}`,
        },
        "&.Mui-disabled .MuiSwitch-thumb": {
            color: theme.palette.action.disabledBackground,
        },
        "&.Mui-disabled + .MuiSwitch-track": {
            opacity: 0.7,
        },
    },
    "& .MuiSwitch-thumb": {
        boxSizing: "border-box",
        width: 22,
        height: 22,
    },
    "& .MuiSwitch-track": {
        borderRadius: 26 / 2,
        backgroundColor: theme.palette.divider,
        opacity: 1,
        transition: theme.transitions.create(["background-color"], {
            duration: 500,
        }),
    },
}));

export default IOSSwitch;
