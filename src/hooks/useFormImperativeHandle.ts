import { useImperativeHandle, useState, Ref, RefObject } from "react"
import { FormElementRef } from "@/types"

interface UseFormImperativeHandleProps {
    ref: Ref<FormElementRef | null>
    containerRef: RefObject<HTMLElement | null>
    // A function to return the current value (since some use state, some use refs)
    getValue: () => string
    validation?: (value: string) => string | undefined | null
    // Optional: logic to focus the specific input inside the container
    onFocus?: () => void
}

export const useFormImperativeHandle = ({
    ref,
    containerRef,
    getValue,
    validation,
    onFocus,
}: UseFormImperativeHandleProps) => {
    const [internalError, setInternalError] = useState<string | undefined>(undefined)

    useImperativeHandle(ref, () => ({
        get value() {
            return getValue()
        },
        get error() {
            return internalError
        },
        validate: () => {
            if (validation) {
                const msg = validation(getValue())
                setInternalError(msg || undefined)
                return !msg
            }
            return true
        },
        focus: () => {
            containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
            if (onFocus) {
                onFocus()
            }
        },
        scrollIntoView: (options?: ScrollIntoViewOptions) => {
            containerRef.current?.scrollIntoView(options || { behavior: "smooth", block: "center" })
        },
    }))

    return {
        internalError,
        setInternalError,
        clearError: () => setInternalError(undefined),
    }
}