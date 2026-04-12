import { forwardRef, ComponentPropsWithoutRef, useImperativeHandle, useRef, useState } from "react"
import clsx from "clsx"
import styles from "./style.module.css"

export interface FormElementRef {
    value: string
    error: string | undefined
    validate: () => boolean
    focus: () => void
}

// Define the types for grouped or single options
export type SelectOption = { display: string; value: string | number }
export type SelectGroup = { groupLabel: string; items: SelectOption[] }
type OptionItem = SelectOption | SelectGroup

interface SelectBoxProps extends Omit<ComponentPropsWithoutRef<"select">, "options"> {
    label?: string
    error?: string
    helperText?: string
    icon?: React.ElementType
    tooltip?: string
    placeholder?: string
    options?: OptionItem[]
    validation?: (value: string) => string | undefined
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
            defaultValue,
            ...rest
        },
        ref,
    ) => {
        const containerRef = useRef<HTMLDivElement>(null)
        const selectRef = useRef<HTMLSelectElement>(null)
        const [internalError, setInternalError] = useState<string | undefined>(undefined)

        // Background color logic: check if we have a value initially
        const [isFilled, setIsFilled] = useState(!!defaultValue)

        const currentError = internalError || externalError
        const hasError = !!currentError

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
                    return !msg
                }
                return true
            },
            focus: () => {
                containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                selectRef.current?.focus({ preventScroll: true })
            },
        }))

        return (
            <div
                ref={containerRef}
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
                        ref={selectRef}
                        // Toggle background class
                        className={clsx(styles.select, isFilled && styles.filled)}
                        required={required}
                        disabled={disabled}
                        defaultValue={defaultValue ?? ""}
                        onChange={(e) => {
                            setIsFilled(!!e.target.value)
                            if (internalError) setInternalError(undefined)
                            onChange?.(e)
                        }}
                        {...rest}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}

                        {options.map((item, idx) => {
                            // If it has 'items', render an optgroup
                            if ("items" in item) {
                                return (
                                    <optgroup
                                        label={item.groupLabel}
                                        key={idx}
                                        className={styles.optgroup}
                                    >
                                        {item.items.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.display}
                                            </option>
                                        ))}
                                    </optgroup>
                                )
                            }
                            // Otherwise render a standard option
                            return (
                                <option key={item.value} value={item.value}>
                                    {item.display}
                                </option>
                            )
                        })}
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
