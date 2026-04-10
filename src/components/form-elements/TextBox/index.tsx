import { forwardRef, ComponentPropsWithoutRef } from "react"
import clsx from "clsx"
import styles from "./style.module.css"

interface TextInputProps extends ComponentPropsWithoutRef<"input"> {
    label?: string
    error?: string
    helperText?: string
    icon?: React.ElementType
    tooltip?: string
}

// Wrap with forwardRef
// The first Type is the element the ref points to (HTMLDivElement)
// The second Type is the Props interface
const TextBox = forwardRef<HTMLDivElement, TextInputProps>(
    (
        { label, error, helperText, className, required, icon: Icon, tooltip, readOnly, ...rest },
        ref, // Add ref here
    ) => {
        const hasError = !!error

        return (
            <div
                ref={ref} // Attach the ref to the container div
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

                <input className={styles.input} required={required} readOnly={readOnly} {...rest} />

                {(error || helperText) && (
                    <p className={clsx(styles.message, hasError && styles.errorMessage)}>
                        {error || helperText}
                    </p>
                )}
            </div>
        )
    },
)

// Set displayName for better debugging in React DevTools
TextBox.displayName = "TextBox"

export default TextBox
