type Result<T, K = string> =
    | { success: true; value: T }
    | { success: false; error: K };

type IsoString = string;

type JobWindow = {
    start: IsoString;
    end: IsoString;
};

export type { Result, JobWindow, IsoString };
