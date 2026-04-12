"use client"

import { forwardRef, useImperativeHandle, useRef, useState, ComponentPropsWithoutRef } from "react"
import clsx from "clsx"
import styles from "./style.module.css"
import { useSignals } from "@preact/signals-react/runtime"
import { RadioInput } from "@/external/my-library/components"

// We omit 'onChange' from the standard div props to avoid type conflicts
// with your custom onChange signature.
type Props = Omit<ComponentPropsWithoutRef<"div">, "onChange"> & {
    label: string
    icon?: React.ElementType
    options: { display: string; value: string }[]
    onChange?: (value: string) => void
    value?: string
    error?: string // External error from props
    helperText?: string
    validation?: (value: string) => string | undefined | null
}

const RadioSelect = forwardRef<any, Props>(
    (
        {
            value,
            onChange,
            icon: Icon,
            label,
            options,
            error: externalError,
            helperText,
            validation,
            className,
            ...rest
        },
        ref,
    ) => {
        useSignals()

        // 1. Internal Refs and State
        const containerRef = useRef<HTMLDivElement>(null)
        const [internalError, setInternalError] = useState<string | undefined>(undefined)

        const currentError = internalError || externalError
        const hasError = !!currentError

        // 2. Expose methods to parent
        useImperativeHandle(ref, () => ({
            get value() {
                return value || ""
            },
            get error() {
                return internalError
            },
            validate: () => {
                if (validation) {
                    const msg = validation(value || "")
                    setInternalError(msg || undefined)
                    return !msg
                }
                return true
            },
            focus: () => {
                // Scroll the container into view
                containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })

                // Attempt to focus the first radio input inside, or fallback to the container
                const firstRadio = containerRef.current?.querySelector("input")
                if (firstRadio) {
                    firstRadio.focus({ preventScroll: true })
                } else {
                    containerRef.current?.focus({ preventScroll: true })
                }
            },
        }))

        return (
            <div
                ref={containerRef} // Reference for scrolling/focusing
                tabIndex={-1} // Ensures the div itself can be focused if no radio input is found
                className={clsx(
                    styles.root,
                    className,
                    hasError && styles.negative, // Applies error styling to the container
                )}
                {...rest}
            >
                <div className={styles.header}>
                    <p className={styles.label}>{label}</p>
                    {Icon && <Icon className={styles.icon} />}
                </div>

                <div className={styles.options}>
                    {options.map((option) => (
                        <RadioInput
                            key={option.value}
                            label={option.display}
                            name="same"
                            onClick={() => {
                                if (internalError) setInternalError(undefined) // Clear error on selection
                                onChange?.(option.value)
                            }}
                            startValue={option.value === value}
                        />
                    ))}
                </div>

                {/* Validation & Helper Text Message */}
                {(currentError || helperText) && (
                    <p className={clsx(styles.message, hasError && styles.errorMessage)}>
                        {currentError || helperText}
                    </p>
                )}
            </div>
        )
    },
)

RadioSelect.displayName = "RadioSelect"
export default RadioSelect
