import TextInput from "../generic/TextInput";
import { VerifiedCheck } from "../icons";
import StepTemplate from "./StepTemplate";
import { useFormContext } from "@/context/hooks";
import styles from "./steps.module.css";
import { useEffect, useRef, useState } from "react";
import { importLibrary, predictionToAddress } from "@/lib/places";

const AddressInput = () => {
    const { form, dispatch } = useFormContext();
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<
        google.maps.places.PlacePrediction[]
    >([]);

    const placesRef = useRef<{
        AutocompleteSuggestion: typeof google.maps.places.AutocompleteSuggestion;
        AutocompleteSessionToken: typeof google.maps.places.AutocompleteSessionToken;
    } | null>(null);
    const sessionTokenRef =
        useRef<google.maps.places.AutocompleteSessionToken | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined,
    );

    useEffect(() => {
        importLibrary("places").then((places) => {
            placesRef.current = {
                AutocompleteSuggestion: places.AutocompleteSuggestion,
                AutocompleteSessionToken: places.AutocompleteSessionToken,
            };
        });
        return () => clearTimeout(debounceRef.current);
    }, []);

    const handleChange = (value: string) => {
        setQuery(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => runSearch(value), 350);
    };

    const runSearch = async (value: string) => {
        const places = placesRef.current;
        if (!places || value.trim() === "") {
            setSuggestions([]);
            return;
        }
        if (!sessionTokenRef.current) {
            sessionTokenRef.current = new places.AutocompleteSessionToken();
        }
        const { suggestions } =
            await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
                input: value,
                region: "us",
                includedPrimaryTypes: ["street_address", "premise"],
                sessionToken: sessionTokenRef.current,
            });
        setSuggestions(
            suggestions
                .map((s) => s.placePrediction)
                // this check sets the type essentially
                .filter((p): p is google.maps.places.PlacePrediction => !!p),
        );
    };

    const handleSelect = async (
        prediction: google.maps.places.PlacePrediction,
    ) => {
        const addressResult = await predictionToAddress(prediction);
        if (!addressResult.success) {
            console.warn(addressResult.error);
            return;
        }
        // fetchFields() closes the billing session; next keystroke opens a new one.
        sessionTokenRef.current = null;

        dispatch({
            type: "set_customer_detail",
            customerDetail: {
                ...form.customerDetail,
                address: addressResult.value,
            },
        });

        setQuery(addressResult.value.formattedAddress ?? prediction.text.text);
        setSuggestions([]);
    };

    return (
        <StepTemplate
            title="Where are you located?"
            subtitle="We will confirm you're in our service area."
        >
            <div className={styles.autocomplete}>
                <TextInput
                    value={query}
                    inputType="text"
                    placeholder="Enter your address"
                    onChange={(e) => handleChange(e.target.value)}
                />
                {suggestions.length > 0 && (
                    <ul className={styles.suggestionList}>
                        {suggestions.map((prediction) => (
                            <li
                                key={prediction.placeId}
                                className={styles.suggestionItem}
                                onClick={() => handleSelect(prediction)}
                            >
                                {prediction.text.text}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className={styles.flexRow}>
                <VerifiedCheck
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#afafaf"
                />
                <span className={styles.muteText}>
                    Serving Pasadena, Glendale, Burbank
                </span>
            </div>
        </StepTemplate>
    );
};

export default AddressInput;
