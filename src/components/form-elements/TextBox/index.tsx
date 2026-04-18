import { forwardRef, useImperativeHandle, useRef, useState, ComponentPropsWithoutRef } from "react"
import clsx from "clsx"
import styles from "./style.module.css"
import { FormElementRef } from "@/types"

// 1. Omit BOTH value and defaultValue from the native input props
interface TextInputProps extends Omit<ComponentPropsWithoutRef<"input">, "value" | "defaultValue"> {
    value?: string | number | readonly string[] | Date | undefined
    defaultValue?: string | number | readonly string[] | Date | undefined // Add Date here
    label?: string
    error?: string
    helperText?: string
    icon?: React.ElementType
    tooltip?: string
    validation?: (value: string) => string | undefined | null
}

const TextBox = forwardRef<FormElementRef, TextInputProps>(
    (
        {
            label,
            error: externalError,
            helperText,
            className,
            required,
            icon: Icon,
            tooltip,
            readOnly,
            validation,
            onChange,
            value,
            defaultValue, // 2. Destructure defaultValue
            ...rest
        },
        ref,
    ) => {
        const containerRef = useRef<HTMLDivElement>(null)
        const inputRef = useRef<HTMLInputElement>(null)
        const [internalError, setInternalError] = useState<string | undefined>(undefined)

        const currentError = internalError || externalError
        const hasError = !!currentError

        useImperativeHandle(ref, () => ({
            get value() {
                return inputRef.current?.value || ""
            },
            get error() {
                return internalError
            },
            validate: () => {
                if (validation && inputRef.current) {
                    const msg = validation(inputRef.current.value)
                    setInternalError(msg || undefined)
                    return !msg
                }
                return true
            },
            // 1. Existing focus method
            focus: () => {
                containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                inputRef.current?.focus({ preventScroll: true })
            },
            // 2. Add this to fix the error:
            scrollIntoView: (options?: ScrollIntoViewOptions) => {
                containerRef.current?.scrollIntoView(options)
            },
        }))

        // 3. Helper to format dates for HTML input compatibility (YYYY-MM-DD)
        const formatValue = (val: any) => {
            if (val instanceof Date) {
                const yyyy = val.getFullYear()
                const mm = String(val.getMonth() + 1).padStart(2, "0")
                const dd = String(val.getDate()).padStart(2, "0")
                return `${yyyy}-${mm}-${dd}`
            }
            return val
        }

        return (
            <div
                ref={containerRef}
                className={clsx(
                    styles.root,
                    className,
                    required && styles.required,
                    hasError && styles.negative,
                    readOnly && styles.readOnly,
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

                <input
                    ref={inputRef}
                    className={styles.input}
                    required={required}
                    readOnly={readOnly}
                    value={formatValue(value)} // Use helper
                    defaultValue={formatValue(defaultValue)} // Use helper
                    onChange={(e) => {
                        if (internalError) setInternalError(undefined)
                        onChange?.(e)
                    }}
                    {...rest}
                />

                {(currentError || helperText) && (
                    <p className={clsx(styles.message, hasError && styles.errorMessage)}>
                        {currentError || helperText}
                    </p>
                )}
            </div>
        )
    },
)

TextBox.displayName = "TextBox"
export default TextBox
