import { forwardRef, useRef, ComponentPropsWithoutRef } from "react"
import clsx from "clsx"
import styles from "./style.module.css"
import { FormElementRef } from "@/types"
import { useFormImperativeHandle } from "@/hooks/useFormImperativeHandle"

interface TextInputProps extends Omit<ComponentPropsWithoutRef<"input">, "value" | "defaultValue"> {
    value?: string | number | readonly string[] | Date | undefined
    defaultValue?: string | number | readonly string[] | Date | undefined
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
            defaultValue,
            ...rest
        },
        ref,
    ) => {
        const containerRef = useRef<HTMLDivElement>(null)
        const inputRef = useRef<HTMLInputElement>(null)

        // --- REUSABLE LOGIC ---
        const { internalError, setInternalError } = useFormImperativeHandle({
            ref,
            containerRef,
            validation,
            getValue: () => inputRef.current?.value || "",
            onFocus: () => inputRef.current?.focus({ preventScroll: true }),
        })

        const currentError = internalError || externalError
        const hasError = !!currentError

        // Helper to format dates for HTML input compatibility (YYYY-MM-DD)
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
                    value={formatValue(value)}
                    defaultValue={formatValue(defaultValue)}
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
