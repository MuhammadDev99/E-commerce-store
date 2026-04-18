"use client"

import { forwardRef, useImperativeHandle, useRef, useState, ComponentPropsWithoutRef } from "react"
import clsx from "clsx"
import styles from "./style.module.css"
import { useSignals } from "@preact/signals-react/runtime"
import { RadioInput } from "@/external/my-library/components"

type Props = Omit<ComponentPropsWithoutRef<"div">, "onChange"> & {
    label: string
    icon?: React.ElementType
    options: { display: string; value: string }[]
    onChange?: (value: string) => void
    value?: string
    defaultValue?: string
    error?: string
    helperText?: string
    validation?: (value: string) => string | undefined | null
}

const RadioSelect = forwardRef<any, Props>(
    (
        {
            value,
            defaultValue,
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

        const containerRef = useRef<HTMLDivElement>(null)
        const [internalError, setInternalError] = useState<string | undefined>(undefined)

        // 1. Add internal state to track the value if the component is uncontrolled
        const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "")

        // 2. Determine the "Active" value:
        // If 'value' is provided by parent, use it (controlled).
        // Otherwise, use our internal state (uncontrolled).
        const activeValue = value !== undefined ? value : uncontrolledValue

        const currentError = internalError || externalError
        const hasError = !!currentError

        useImperativeHandle(ref, () => ({
            get value() {
                return activeValue
            },
            get error() {
                return internalError
            },
            validate: () => {
                if (validation) {
                    const msg = validation(activeValue)
                    setInternalError(msg || undefined)
                    return !msg
                }
                return true
            },
            focus: () => {
                containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                const firstRadio = containerRef.current?.querySelector("input")
                if (firstRadio) {
                    firstRadio.focus({ preventScroll: true })
                } else {
                    containerRef.current?.focus({ preventScroll: true })
                }
            },
        }))

        const handleSelect = (newValue: string) => {
            // Update internal state so the UI changes immediately
            setUncontrolledValue(newValue)

            // Clear error
            if (internalError) setInternalError(undefined)

            // Notify parent
            onChange?.(newValue)
        }

        return (
            <div
                ref={containerRef}
                tabIndex={-1}
                className={clsx(styles.root, className, hasError && styles.negative)}
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
                            name={label} // Use a unique name per group
                            onClick={() => handleSelect(option.value)}
                            // UI reflects either the prop or the internal state
                            startValue={option.value === activeValue}
                        />
                    ))}
                </div>

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
