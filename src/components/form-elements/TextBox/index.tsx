import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef } from "react"

// Extend the standard HTML input props
interface TextInputProps extends ComponentPropsWithoutRef<"input"> {
    label?: string
    message?: string
    negative?: boolean
    icon?: React.ElementType
    tooltip?: string // New prop
}
export default function TextBox({
    label,
    message,
    negative = false,
    className,
    required,
    icon: Icon,
    tooltip,
    readOnly,
    ...rest
}: TextInputProps) {
    return (
        <div
            className={clsx(
                styles.root,
                className,
                required && styles.required,
                negative && styles.negative,
                readOnly ? styles.readOnly : "",
            )}
        >
            {label && (
                <div className={styles.labelWrapper}>
                    <p className={styles.label}>
                        {label} {/*  {required ? "" : "(اختياري)"} */}
                    </p>

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
            {message && <p className={styles.message}>{message}</p>}
        </div>
    )
}
