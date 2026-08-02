import { ListItem } from "@/models/Form";
import styles from "./verticallist.module.css";

type VerticalListProps = {
    items: ListItem[];
    onClick?: (id: string) => void;
};

const VerticalList = ({ items, onClick }: VerticalListProps) => {
    return (
        <div className={styles.verticalList}>
            {items.map((item) => {
                return (
                    <option
                        className={styles.listOption}
                        onClick={() => {
                            if (onClick) {
                                onClick(item.id);
                            }
                        }}
                    ></option>
                );
            })}
        </div>
    );
};

export default VerticalList;
