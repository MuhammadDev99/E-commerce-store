import { forwardRef, ComponentPropsWithoutRef, useImperativeHandle, useRef, useState } from "react"
import clsx from "clsx"
import styles from "./style.module.css"

// Ensure this matches the interface used in TextBox
export interface FormElementRef {
    value: string
    error: string | undefined
    validate: () => boolean
    focus: () => void
}

interface SelectBoxProps extends ComponentPropsWithoutRef<"select"> {
    label?: string
    error?: string // External error prop
    helperText?: string
    icon?: React.ElementType
    tooltip?: string
    placeholder?: string
    options?: { display: string; value: string | number }[]
    validation?: (value: string) => string | undefined // Validation function
}

const SelectBox = forwardRef<FormElementRef, SelectBoxProps>(
    (
        {
            label,
            error: externalError,
            helperText,
            className,
            required,
            icon: Icon,
            tooltip,
            disabled,
            options = [],
            placeholder,
            validation,
            onChange,
            ...rest
        },
        ref,
    ) => {
        // 1. Internal Refs for DOM and State for errors
        const containerRef = useRef<HTMLDivElement>(null)
        const selectRef = useRef<HTMLSelectElement>(null)
        const [internalError, setInternalError] = useState<string | undefined>(undefined)

        const currentError = internalError || externalError
        const hasError = !!currentError

        // 2. Expose methods to the parent via the forwarded ref
        useImperativeHandle(ref, () => ({
            get value() {
                return selectRef.current?.value || ""
            },
            get error() {
                return internalError
            },
            validate: () => {
                if (validation && selectRef.current) {
                    const msg = validation(selectRef.current.value)
                    setInternalError(msg)
                    return !msg // returns true if valid (no msg)
                }
                return true
            },
            focus: () => {
                // Scroll the whole component into view
                containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                // Focus the actual select element
                selectRef.current?.focus({ preventScroll: true })
            },
        }))

        return (
            <div
                ref={containerRef} // Used for scrolling
                className={clsx(
                    styles.root,
                    className,
                    required && styles.required,
                    hasError && styles.negative,
                    disabled && styles.disabled,
                )}
            >
                {label && (
                    <div className={styles.labelWrapper}>
                        <p className={styles.label}>{label}</p>
                        {Icon && <Icon className={styles.icon} />}
                        {tooltip && (
                            <div className={styles.tooltipContainer} tabIndex={0}>
                                <span className={styles.tooltipTrigger}>?</span>
                                <div className={styles.tooltipBox}>{tooltip}</div>
                            </div>
                        )}
                    </div>
                )}

                <div className={styles.selectWrapper}>
                    <select
                        ref={selectRef} // Used for value and focus
                        className={styles.select}
                        required={required}
                        disabled={disabled}
                        onChange={(e) => {
                            if (internalError) setInternalError(undefined) // Clear error when user selects
                            onChange?.(e)
                        }}
                        {...rest}
                    >
                        {placeholder && (
                            <option value="" disabled hidden>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.display}
                            </option>
                        ))}
                    </select>
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

SelectBox.displayName = "SelectBox"

export default SelectBox
