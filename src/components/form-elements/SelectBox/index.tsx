import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef } from "react"
import { DownArrow2SVG, DownArrowSVG } from "@/images"

// Extend the standard HTML input props
interface SelectBoxProps extends ComponentPropsWithoutRef<"select"> {
    label?: string
    message?: string
    negative?: boolean
    options?: { display: string; value: string }[]
}

export default function SelectBox({
    options = [],
    label,
    message,
    negative = false,
    className,
    required, // destructured so we can use it for the wrapper's CSS logic
    ...rest // this contains type, value, onChange, placeholder, etc.
}: SelectBoxProps) {
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

            <div className={styles.dropdownWrapper}>
                <select className={styles.dropdown} required={required} {...rest}>
                    {options.map((option) => {
                        return (
                            <option key={option.value} value={option.value}>
                                {option.display}
                            </option>
                        )
                    })}
                </select>
            </div>

            {message && <p className={styles.message}>{message}</p>}
        </div>
    )
}
