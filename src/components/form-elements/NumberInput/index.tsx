import clsx from "clsx"
import styles from "./style.module.css"
import { ChangeEvent, ComponentPropsWithoutRef } from "react"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import { clampNumber } from "@/external/my-library/utils"

interface TextInputProps extends ComponentPropsWithoutRef<"input"> {
    label?: string
    message?: string
    negative?: boolean
    unit?: string
}

export default function NumberInput({
    label,
    message,
    negative = false,
    className,
    required,
    unit = "",
    value,
    disabled,
    ...rest
}: TextInputProps) {
    useSignals()

    // 1. Initialize with empty string to allow placeholder to show
    const inputValueSignal = useSignal<string>(value?.toString() ?? "")

    const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { onChange, min, max } = rest
        const rawValue = event.target.value

        // 2. Allow empty input so user can delete everything
        if (rawValue === "") {
            inputValueSignal.value = ""
            onChange?.(event)
            return
        }

        // 3. Convert to number and clamp
        let numericValue = Number(rawValue)

        // Only clamp if the value is a valid number
        if (!isNaN(numericValue)) {
            const clamped = clampNumber(
                numericValue,
                min !== undefined ? Number(min) : -Infinity,
                max !== undefined ? Number(max) : Infinity,
            )
            inputValueSignal.value = clamped.toString()
        }

        onChange?.(event)
    }

    return (
        <div
            className={clsx(
                styles.root,
                className,
                required && styles.required,
                negative && styles.negative,
                disabled && styles.disabled,
            )}
        >
            {label && <p className={styles.label}>{label}</p>}
            <div className={styles.inputWrapper}>
                {unit && <p className={styles.unit}>{unit}</p>}
                <input
                    className={styles.input}
                    required={required}
                    type="number"
                    {...rest}
                    onChange={handleValueChange}
                    // 4. Bind value to the signal string
                    value={inputValueSignal.value}
                    inputMode="numeric"
                />
            </div>

            {message && <p className={styles.message}>{message}</p>}
        </div>
    )
}
