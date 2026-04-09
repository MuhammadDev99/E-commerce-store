import { useCallback, useEffect, useRef } from "react"

export function useDebouncedCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
) {
    // Used to store the timeout
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Used to keep track of the latest callback so we don't have stale closures
    const callbackRef = useRef(callback)

    // Update the ref whenever the callback changes
    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    const debouncedFunction = useCallback(
        (...args: Parameters<T>) => {
            // Clear the previous timeout if it exists
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            // Set a new timeout
            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args)
            }, delay)
        },
        [delay]
    )

    return debouncedFunction
}