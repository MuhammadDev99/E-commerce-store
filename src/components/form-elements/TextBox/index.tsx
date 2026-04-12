import { forwardRef, useImperativeHandle, useRef, useState, ComponentPropsWithoutRef } from "react"
import clsx from "clsx"
import styles from "./style.module.css"

interface TextInputProps extends ComponentPropsWithoutRef<"input"> {
    label?: string
    error?: string // External error from props
    helperText?: string
    icon?: React.ElementType
    tooltip?: string
    validation?: (value: string) => string | undefined | null
}

const TextBox = forwardRef<any, TextInputProps>(
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
            ...rest
        },
        ref,
    ) => {
        // 1. Internal Refs
        const containerRef = useRef<HTMLDivElement>(null)
        const inputRef = useRef<HTMLInputElement>(null)
        const [internalError, setInternalError] = useState<string | undefined>(undefined)

        const currentError = internalError || externalError
        const hasError = !!currentError

        // 2. Expose methods to parent
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
            focus: () => {
                containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                inputRef.current?.focus({ preventScroll: true })
            },
        }))

        return (
            <div
                ref={containerRef} // This ref is for scrolling
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
                    ref={inputRef} // This ref is for the value/focus
                    className={styles.input}
                    required={required}
                    readOnly={readOnly}
                    onChange={(e) => {
                        if (internalError) setInternalError(undefined) // Clear error on type
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
