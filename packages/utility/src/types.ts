type Result<T, K = string> =
    | { success: true; value: T }
    | { success: false; error: K };

export type { Result };
