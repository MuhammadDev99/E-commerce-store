import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef } from "react"

// Extend the standard HTML input props
interface TextInputProps extends ComponentPropsWithoutRef<"input"> {
    label?: string
    message?: string
    negative?: boolean
    icon?: React.ElementType
}

export default function TextBox({
    label,
    message,
    negative = false,
    className,
    required,
    icon: Icon,
    ...rest
}: TextInputProps) {
    return (
        <div
            className={clsx(
                styles.root,
                className,
                required && styles.required,
                negative && styles.negative,
            )}
        >
            {label && (
                <div className={styles.labelWrapper}>
                    <p className={styles.label}>{label}</p>
                    {Icon && <Icon className={styles.icon} />}
                </div>
            )}

            <input
                className={styles.input}
                required={required}
                {...rest} // Spreads all standard input props automatically
            />

            {message && <p className={styles.message}>{message}</p>}
        </div>
    )
}
