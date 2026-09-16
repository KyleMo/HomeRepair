"use client";
import { useOrganizations } from "@/hooks";
import PageLayout from "@/components/PageLayout";
import { useQuery } from "@tanstack/react-query";
import Stack from "@mui/material/Stack";
import { TextField } from "@mui/material";
import { useState } from "react";
import FilterChip from "@/components/FilterChip";
import BookingDateContainer from "./BookingDateContainer";
import { BOOKING_STATUSES, BookingsResponse } from "@/types/booking";
import dayts from "@/lib/dayjs";
import { BookingStatus } from "@homerepair/data";

const FILTER_CHIPS = ["All", ...BOOKING_STATUSES];

type BookingFilter = BookingStatus | "All";

const Bookings = () => {
    const { org, companyQuery } = useOrganizations();
    const [filters, setFilter] = useState<BookingFilter[]>(["All"]);

    const handleSetFilter = (value: BookingFilter) => {
        setFilter((prev) => {
            if (value === "All" && !filters.includes("All")) {
                return ["All"];
            }

            let newValues = [...prev];
            if (newValues.includes("All")) {
                return [value as BookingFilter];
            }

            const valueIndex = newValues.findIndex((item) => item === value);
            if (valueIndex !== -1) newValues.splice(valueIndex, 1);
            else newValues.push(value);

            if (newValues.length === 0) return ["All"];

            return newValues;
        });
    };
    const now = dayts().utc();

    const {
        data: bookingResponse,
        isLoading,
        isFetching,
        isRefetching,
    } = useQuery<BookingsResponse | undefined>({
        queryKey: [filters, companyQuery, org?.id, filters],
        queryFn: async () => {
            if (!org) {
                console.warn("Organization is not defined");
                return undefined;
            }

            const urlSearchParams = new URLSearchParams();

            companyQuery.forEach((id) =>
                urlSearchParams.append("companyIds", id),
            );
            filters.forEach((f) => {
                if (f !== "All") urlSearchParams.append("status", f);
            });

            urlSearchParams.append("from", now.toISOString());

            const bookingResponse = await fetch(
                `/api/organization/${org.id}/booking?${urlSearchParams}`,
            );

            if (!bookingResponse.ok)
                throw new Error(
                    `Failed to load bookings (${bookingResponse.status})`,
                );

            return (await bookingResponse.json()) as BookingsResponse;
        },
    });

    const timezone = bookingResponse?.timezone;
    const bookingDays = bookingResponse?.days ?? [];
    const totalBookings = bookingDays.reduce((acc, curr) => {
        return (acc += curr.bookings.length);
    }, 0);

    return (
        <PageLayout
            title="Bookings"
            subtitle={`${totalBookings} bookings`}
            isLoading={isLoading || isFetching || isRefetching}
        >
            <Stack
                direction="row"
                sx={{ gap: 1.5, alignItems: "center", flexWrap: "wrap" }}
            >
                <TextField
                    size="small"
                    placeholder="Search customer, address, model..."
                    sx={{ display: { xs: "none", md: "block" } }}
                />
                {FILTER_CHIPS.map((fc) => {
                    return (
                        <FilterChip
                            key={fc}
                            selected={filters.includes(
                                fc as BookingStatus | "All",
                            )}
                            label={fc}
                            onClick={() => {
                                handleSetFilter(fc as BookingFilter);
                            }}
                        />
                    );
                })}
            </Stack>
            <Stack spacing={2} sx={{ marginTop: 2 }}>
                {bookingDays.map((bd) => {
                    return (
                        <BookingDateContainer
                            bookingDay={bd}
                            key={bd.date}
                            timezone={timezone}
                        />
                    );
                })}
            </Stack>
        </PageLayout>
    );
};

export default Bookings;
