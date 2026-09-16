import Stack from "@mui/material/Stack";
import { formatBookingDate } from "@homerepair/utility/client";
import { Typography } from "@mui/material";
import BookingCard from "./BookingCard";
import { CompanyBookingDay } from "@/types/booking";
import dayjs from "@/lib/dayjs";

type BookingDateContainerProps = {
    bookingDay: CompanyBookingDay;
    /** The zone the server bucketed these days against. */
    timezone?: string;
};

// Booking date is passed over as UTC and is convert to the local time - its assumed the company we are viewing
const BookingDateContainer = ({
    bookingDay,
    timezone,
}: BookingDateContainerProps) => {
    const today = dayjs().tz(timezone);
    const isToday = bookingDay.date === today.format("YYYY-MM-DD");
    const isTomorrow =
        bookingDay.date === today.add(1, "day").format("YYYY-MM-DD");

    const bookingDayCount = bookingDay.bookings.length;
    let bookingDateString = formatBookingDate(bookingDay.date);
    if (isToday)
        bookingDateString = "Today, " + formatBookingDate(bookingDay.date);
    else if (isTomorrow)
        bookingDateString = "Tomorrow, " + formatBookingDate(bookingDay.date);

    return (
        <Stack sx={{ gap: 1 }}>
            <Stack
                direction="row"
                sx={{
                    alignItems: "center",
                    gap: 2,
                    backgroundColor: "background.default",
                }}
            >
                <Typography sx={{ fontWeight: 700, fontSize: 17 }} noWrap>
                    {bookingDateString}
                </Typography>
                <Typography variant="label" noWrap>
                    {bookingDayCount}{" "}
                    {bookingDayCount === 1 ? "booking" : "bookings"}
                </Typography>
            </Stack>

            <Stack sx={{ gap: 1 }}>
                {bookingDay.bookings.map((b) => {
                    return (
                        <BookingCard
                            key={b.id}
                            booking={b}
                            timezone={timezone}
                        />
                    );
                })}
            </Stack>
        </Stack>
    );
};

export default BookingDateContainer;
