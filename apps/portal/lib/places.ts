import { Address } from "@/models/Form";
import { Result } from "@/models/Result";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

// will try to run as a singleton in SSR and on front end. window not available in SSR
if (typeof window !== "undefined") {
    setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY });
}

// Pull a single value out of the Places addressComponents array.
const getComponent = (
    components: google.maps.places.AddressComponent[],
    type: string,
    useShort = false,
) => {
    const match = components.find((c) => c.types.includes(type));
    if (!match) return "";
    return (useShort ? match.shortText : match.longText) ?? "";
};

const predictionToAddress = async (
    prediction: google.maps.places.PlacePrediction,
): Promise<Result<Address>> => {
    try {
        const place = prediction.toPlace();
        await place.fetchFields({
            fields: ["addressComponents", "formattedAddress"],
        });
        const components = place.addressComponents ?? [];

        return {
            success: true,
            value: {
                street: `${getComponent(components, "street_number")} ${getComponent(components, "route")}`.trim(),
                city: getComponent(components, "locality"),
                state: getComponent(
                    components,
                    "administrative_area_level_1",
                    true,
                ),
                zipcode: getComponent(components, "postal_code"),
                formattedAddress: place.formattedAddress,
            } as Address,
        };
    } catch (error) {
        return {
            success: false,
            error: "An unknown exeception occured converting prediction to address",
        };
    }
};

export { importLibrary, getComponent, predictionToAddress };
