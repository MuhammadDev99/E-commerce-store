import { DisplayLanguage } from "@/types";

export function getDisplayLanguage(): DisplayLanguage {
    return 'arabic'
}

export function debounced<T extends (...args: any[]) => void>(
    cb: T,
    delay: number = 300
) {
    let timeout: ReturnType<typeof setTimeout>;

    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            cb(...args);
        }, delay);
    };
}