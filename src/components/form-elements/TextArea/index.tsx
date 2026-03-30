"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { ChangeEvent, ComponentPropsWithoutRef, useEffect } from "react"
import { useSignal, useSignals } from "@preact/signals-react/runtime"

// We still need Omit because the native onChange expects an Event,
// but you want it to return a string.
interface TextInputProps extends Omit<ComponentPropsWithoutRef<"textarea">, "onChange"> {
    label?: string
    message?: string
    negative?: boolean
    charLimit?: number // We will map this to native maxLength
    value?: string
    onChange?: (value: string) => void
}

export default function TextArea({
    label,
    message,
    negative = false,
    className,
    required,
    charLimit,
    value = "",
    onChange,
    ...rest
}: TextInputProps) {
    useSignals()

    const inputValue = useSignal<string>(value)

    // Sync signal if value prop changes from parent
    useEffect(() => {
        inputValue.value = value
    }, [value])

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const textContent = event.target.value
        inputValue.value = textContent
        onChange?.(textContent)
    }

    return (
        <div
            className={clsx(
                styles.root,
                className,
                required && styles.required,
                negative && styles.negative,
                styles.arabic,
            )}
        >
            {label && <p className={styles.label}>{label}</p>}

            <div className={styles.inputWrapper}>
                {/* Visual counter */}
                {charLimit && (
                    <p className={styles.counter}>{charLimit - inputValue.value.length}</p>
                )}

                <textarea
                    className={styles.input}
                    required={required}
                    onChange={handleInputChange}
                    value={inputValue.value}
                    maxLength={charLimit} // Browser handles the limit automatically
                    {...rest}
                />
            </div>

            {message && <p className={styles.message}>{message}</p>}
        </div>
    )
}
