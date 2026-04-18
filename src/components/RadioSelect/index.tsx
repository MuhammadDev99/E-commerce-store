"use client"

import { forwardRef, useRef, useState, ComponentPropsWithoutRef } from "react"
import clsx from "clsx"
import styles from "./style.module.css"
import { useSignals } from "@preact/signals-react/runtime"
import { RadioInput } from "@/external/my-library/components"
import { FormElementRef } from "@/types"
import { useFormImperativeHandle } from "@/hooks/useFormImperativeHandle"

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

const RadioSelect = forwardRef<FormElementRef, Props>(
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

        // 1. Uncontrolled state logic
        const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "")
        const activeValue = value !== undefined ? value : uncontrolledValue

        // 2. --- REUSABLE LOGIC ---
        const { internalError, setInternalError } = useFormImperativeHandle({
            ref,
            containerRef,
            validation,
            getValue: () => activeValue,
            onFocus: () => {
                const firstRadio = containerRef.current?.querySelector("input")
                if (firstRadio) {
                    firstRadio.focus({ preventScroll: true })
                } else {
                    containerRef.current?.focus({ preventScroll: true })
                }
            },
        })

        const currentError = internalError || externalError
        const hasError = !!currentError

        const handleSelect = (newValue: string) => {
            setUncontrolledValue(newValue)

            // Clear error via the hook's state
            if (internalError) setInternalError(undefined)

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
                            name={label}
                            onClick={() => handleSelect(option.value)}
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
