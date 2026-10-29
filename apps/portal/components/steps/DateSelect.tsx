import { useEffect, useState } from "react";
import StepTemplate from "./StepTemplate";
import styles from "./steps.module.css";
import Button from "../generic/Button";
import { useClient, useFormContext } from "@/context/hooks";
import { AvailabilityResult } from "@/models/Form";
import { dayjs, formatJobTimeInterval } from "@homerepair/utility";

const DateSelect = () => {
    const { clientId } = useClient();
    const { form, dispatch } = useFormContext();
    // ISO instant to search from; null means "now" (today's remaining slots).
    const [from, setFrom] = useState<string | null>(null);

    const availability = form.availability;

    const handleNextDay = () => {
        if (!availability) return;
        // Step in the company's zone so "tomorrow" is the company's tomorrow,
        // and startOf("day") lands on its midnight even across a DST change.
        const nextDay = dayjs(availability.date)
            .tz(availability.timezone)
            .add(1, "day")
            .startOf("day");
        setFrom(nextDay.toISOString());
    };

    useEffect(() => {
        // should only refetch if we are on this page though
        if (form.cursor.stepId !== "hr_arrival_window") return;

        const controller = new AbortController();
        // Clear the previous day so the list shows loading, not stale times.
        dispatch({ type: "set_availability", availability: null });

        const fetchAvailability = async () => {
            try {
                const res = await fetch(
                    `/api/company/${clientId}/availability`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            from: from ?? new Date().toISOString(),
                            // The API wants nulls, not missing keys.
                            repairs: form.repairs.map((r) => ({
                                companyServiceId: r.companyServiceId,
                                brandId: r.brandId ?? null,
                                symptomId: r.symptoms[0] ?? null,
                            })),
                        }),
                        signal: controller.signal,
                    },
                );
                if (!res.ok) throw new Error(`Request failed: ${res.status}`);
                dispatch({
                    type: "set_availability",
                    availability: (await res.json()) as AvailabilityResult,
                });
            } catch (err) {
                if (controller.signal.aborted) return; // cancelled on purpose, ignore
                dispatch({
                    type: "set_error",
                    error: "Failed to load availabilty",
                });
            }
        };

        fetchAvailability();

        return () => controller.abort();
    }, [clientId, dispatch, form.repairs, form.cursor.stepId, from]);

    return (
        <StepTemplate
            title={"Pick an arrival window"}
            subtitle="Your technician will text when they're on the way."
        >
            {!availability ? (
                <div>Loading available times…</div>
            ) : (
                <>
                    <div
                        className={styles.flexRow}
                        style={{ justifyContent: "space-between" }}
                    >
                        <h4>
                            {dayjs(availability.date)
                                .tz(availability.timezone)
                                .format("dddd, MMM D")}
                        </h4>
                        <Button onClick={handleNextDay}>Next day</Button>
                    </div>
                    {availability.startTimes.length === 0 ? (
                        <div>No times available. Please try another day.</div>
                    ) : (
                        <div className={styles.timeList}>
                            {availability.startTimes.map((startTime) => {
                                const start = dayjs(startTime);
                                const end = start.add(
                                    availability.durationMinutes,
                                    "minute",
                                );
                                return (
                                    <div
                                        key={startTime}
                                        className={styles.listItem}
                                    >
                                        {formatJobTimeInterval(
                                            start,
                                            end,
                                            availability.timezone,
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </StepTemplate>
    );
};

export default DateSelect;
