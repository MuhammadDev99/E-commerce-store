import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef } from "react"

// Extend the standard HTML input props
interface TextInputProps extends ComponentPropsWithoutRef<"input"> {
    label?: string
    message?: string
    negative?: boolean
}

export default function TextBox({
    label,
    message,
    negative = false,
    className,
    required, // destructured so we can use it for the wrapper's CSS logic
    ...rest // this contains type, value, onChange, placeholder, etc.
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
            {label && <p className={styles.label}>{label}</p>}

            <input
                className={styles.input}
                required={required}
                {...rest} // Spreads all standard input props automatically
            />

            {message && <p className={styles.message}>{message}</p>}
        </div>
    )
}
