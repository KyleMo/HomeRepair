import { useState } from "react";
import { useFormContext } from "../../context/hooks";
import styles from "./steps.module.css";
import Pill from "../generic/Pill";
import TextInput from "../generic/TextInput";
import StepTemplate from "./StepTemplate";
import { ListItem } from "@/models/Form";

const options: ListItem[] = [
    { id: "1", label: "Whirpool" },
    { id: "2", label: "Samsung" },
    { id: "3", label: "LG" },
    { id: "4", label: "GE" },
    { id: "5", label: "Kenmore" },
    { id: "6", label: "Maytag" },
    { id: "7", label: "Speed Queen" },
    { id: "8", label: "Not Sure" },
];

const BrandSelection = () => {
    const { form, dispatch } = useFormContext();
    const repair = form.repairs.find((r) => r.id === form.cursor.repairId);
    const [search, setSearch] = useState<string>("");

    if (!repair) {
        return <div>Please go back and select an item to repair</div>;
    }

    const handleBrandClick = (id?: string) => {
        dispatch({ type: "update_repair", repair: { ...repair, brandId: id } });
    };
    const triggerNextPage = () => {
        dispatch({ type: "next_step" });
    };

    const selectedBrand = options.find((o) => o.id === repair.brandId);
    const brands = search
        ? options.filter(
              (o) =>
                  o.label
                      .toLocaleLowerCase()
                      .includes(search.toLocaleLowerCase()) &&
                  o.id !== repair.brandId,
          )
        : [];

    return (
        <StepTemplate
            title={`What's the brand of your ${repair.label.toLocaleLowerCase()}?`}
        >
            <TextInput
                value={search ?? ""}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search brands"
            ></TextInput>
            {search || selectedBrand ? (
                <div className={styles.brandList} style={{ marginTop: 5 }}>
                    {selectedBrand && (
                        <div
                            onClick={() => handleBrandClick(undefined)}
                            className={`${styles.listItem} ${styles.selected}`}
                        >
                            {selectedBrand.label}
                        </div>
                    )}
                    {brands.map((b) => {
                        return (
                            <div
                                onClick={() => {
                                    handleBrandClick(b.id);
                                }}
                                className={`${styles.listItem} ${
                                    repair.brandId === b.id
                                        ? styles.selected
                                        : ""
                                }`}
                                key={b.id}
                            >
                                {b.label}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <>
                    <h4
                        className={styles.muteText}
                        style={{ fontWeight: 600, fontSize: ".75rem" }}
                    >
                        {"Popular Brands".toUpperCase()}
                    </h4>
                    <div className={styles.flexWrapContainer}>
                        {options.map((o) => {
                            return (
                                <Pill
                                    key={o.id}
                                    id={o.id}
                                    onClick={() => {
                                        handleBrandClick(o.id);
                                        triggerNextPage();
                                    }}
                                >
                                    {o.label}
                                </Pill>
                            );
                        })}
                    </div>
                </>
            )}
        </StepTemplate>
    );
};

export default BrandSelection;
