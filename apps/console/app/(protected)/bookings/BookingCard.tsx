import Stack from "@mui/material/Stack";
import { Card, Chip, Typography } from "@mui/material";
import { formatJobTimeInterval } from "@homerepair/utility/client";
import type { BookingStatus, CompanyBooking } from "@homerepair/data/types";
import { CompanyBookingSummary } from "@/types/booking";
import dayts from "@/lib/dayjs";

type BookingCardProps = {
    // TODO: replace with the real booking type once the API is wired up.
    booking: CompanyBookingSummary;
    /** The zone the day list was grouped against — see formatInstantRange. */
    timezone?: string;
};

const STATUS_CHIP: Record<
    BookingStatus,
    {
        label: string;
        color: "success" | "warning" | "default";
        variant: "filled" | "outlined";
    }
> = {
    Scheduled: { label: "Scheduled", color: "default", variant: "filled" },
    InProgress: { label: "In progress", color: "warning", variant: "filled" },
    Completed: { label: "Done", color: "success", variant: "filled" },
    Cancelled: { label: "Cancelled", color: "default", variant: "outlined" },
};

const BookingCard = ({ booking, timezone }: BookingCardProps) => {
    const chip = STATUS_CHIP[booking.status];

    return (
        <Card sx={{ overflow: "hidden" }}>
            <Stack
                direction="column"
                sx={{
                    flexDirection: { sm: "row" },
                    alignItems: "stretch",
                    opacity: booking.status === "Cancelled" ? 0.6 : 1,
                }}
            >
                <Stack
                    sx={{
                        width: { sm: 150 },
                        flexShrink: 0,
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.25,
                        padding: 1,
                        backgroundColor: "primary.light",
                        color: "primary.dark",
                    }}
                >
                    <Typography
                        sx={{
                            fontWeight: 700,
                            fontSize: 15,
                            textAlign: "center",
                            color: "inherit",
                        }}
                    >
                        {timezone
                            ? formatJobTimeInterval(
                                  dayts(booking.start_time),
                                  dayts(booking.end_time),
                                  timezone,
                              )
                            : "No timezone"}
                    </Typography>
                    <Typography
                        variant="label"
                        noWrap
                        sx={{ fontSize: 12, color: "inherit", opacity: 0.75 }}
                    >
                        {booking.id.slice(
                            booking.id.length - 10,
                            booking.id.length,
                        )}
                    </Typography>
                </Stack>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    sx={{
                        flexGrow: 1,
                        minWidth: 0,
                        gap: 1.5,
                        padding: 2,
                        justifyContent: "space-between",
                    }}
                >
                    <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: "center" }}
                        >
                            <Typography
                                sx={{ fontWeight: 700, fontSize: 17 }}
                                noWrap
                            >
                                {booking.company_service.appliance_type.name}
                            </Typography>
                            <Chip
                                size="small"
                                label={chip.label}
                                color={chip.color}
                                variant={chip.variant}
                            />
                        </Stack>

                        <Typography
                            variant="label"
                            noWrap
                            sx={{ fontSize: 12.5, fontWeight: 500 }}
                        >
                            {booking.booking_symptoms.map(
                                (s) => s.symptom.name + ", ",
                            )}
                        </Typography>

                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={{ xs: 0, sm: 1 }}
                            sx={{ minWidth: 0 }}
                        >
                            <Typography
                                variant="label"
                                noWrap
                                sx={{ fontWeight: 700, color: "text.primary" }}
                            >
                                {booking.customer.first_name +
                                    " " +
                                    booking.customer.last_name}
                            </Typography>
                            <Typography
                                variant="label"
                                noWrap
                                sx={{
                                    display: { xs: "none", sm: "block" },
                                    fontWeight: 400,
                                }}
                            >
                                ·
                            </Typography>
                            <Typography
                                variant="label"
                                noWrap
                                sx={{ fontWeight: 400 }}
                            >
                                {`${booking.line1}, ${booking.city}, ${booking.state}`}
                            </Typography>
                        </Stack>
                    </Stack>

                    <Stack
                        spacing={0.25}
                        sx={{
                            flexShrink: 0,
                            alignItems: { xs: "flex-start", md: "flex-end" },
                            // Vertically centred against the card rather than
                            // pinned to the top alongside the appliance name.
                            justifyContent: "center",
                        }}
                    >
                        <Typography variant="label" noWrap>
                            Credit Card
                        </Typography>
                        <Typography
                            variant="label"
                            noWrap
                            sx={{
                                color: false
                                    ? "text.secondary"
                                    : "warning.main",
                                fontWeight: false ? 500 : 700,
                            }}
                        >
                            {"Unassigned"}
                        </Typography>
                    </Stack>
                </Stack>
            </Stack>
        </Card>
    );
};

export default BookingCard;
