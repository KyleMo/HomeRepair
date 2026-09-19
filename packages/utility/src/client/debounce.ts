export const debounce = <TArgs extends unknown[]>(
    func: (...args: TArgs) => unknown,
    delay: number,
) => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    return (...args: TArgs) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
};
