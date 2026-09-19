/**
 * Turns any string into a URL/DB-safe slug: lowercase, ASCII letters and
 * digits only, spaces and punctuation collapsed to single dashes, no leading
 * or trailing dashes. Accented characters are folded to their base letter
 * (e.g. "Café del Mar" -> "cafe-del-mar").
 */
export const slugify = (value: string): string =>
    value
        .normalize("NFKD") // split accented chars into base letter + diacritic
        .replace(/\p{Diacritic}/gu, "") // strip the diacritics (cafe accent -> cafe)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // collapse any run of non-alphanumerics to one dash
        .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes

export const formatPhoneNumber = (input: string) => {
    const digits = input.replace(/\D/g, "");
    const match = digits.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (!match) {
        return input;
    }
    return `(${match[1]}) ${match[2]} ${match[3]}`;
};

/**
 * Progressively formats a phone number as it is typed, adding punctuation
 * once enough digits are present. Extra digits beyond 10 are ignored.
 *
 * e.g. "1" -> "(1", "123" -> "(123)", "1234567890" -> "(123) 456 7890"
 */
export const formatPhoneNumberProgressive = (input: string) => {
    const digits = input.replace(/\D/g, "").slice(0, 10);
    if (digits.length === 0) {
        return "";
    }

    const area = digits.slice(0, 3);
    const prefix = digits.slice(3, 6);
    const line = digits.slice(6, 10);

    let result = `(${area}`;
    if (digits.length >= 3) {
        result += ")";
    }
    if (prefix) {
        result += ` ${prefix}`;
    }
    if (line) {
        result += ` ${line}`;
    }
    return result;
};

/**
 * Accepts what someone actually types into a hex field — `0f6e56`, `#0F6`,
 * stray whitespace — and returns a canonical `#RRGGBB`, or null if it isn't a
 * hex colour at all (in which case the field snaps back to its last good value).
 */
export const normalizeHex = (input: string): string | null => {
    const raw = input.trim().replace(/^#/, "");

    if (/^[0-9a-fA-F]{3}$/.test(raw)) {
        return `#${raw
            .split("")
            .map((char) => char + char)
            .join("")}`.toUpperCase();
    }

    return /^[0-9a-fA-F]{6}$/.test(raw) ? `#${raw}`.toUpperCase() : null;
};
