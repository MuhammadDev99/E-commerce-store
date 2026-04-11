"use client"

import React, { useState, forwardRef, ComponentPropsWithoutRef } from "react"
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input"
import "react-phone-number-input/style.css"
import styles from "./style.module.css"
import clsx from "clsx"
import { Phone } from "lucide-react"

// 1. Extend ComponentPropsWithoutRef to allow passing standard div props
// We omit "onChange" from standard div props because PhoneInput expects a string, not an Event.
export interface ModernPhoneInputProps extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
    value?: string
    onChange?: (value: string) => void
    label?: string
    error?: string // Add the error prop
}

// 2. Wrap with forwardRef
const ModernPhoneInput = forwardRef<HTMLDivElement, ModernPhoneInputProps>(
    (
        { className, value, onChange, label = "رقم الجوال", error, ...rest },
        ref, // Add ref here
    ) => {
        const [isTouched, setIsTouched] = useState(false)
        const [isValid, setIsValid] = useState<boolean | null>(null)

        const handleChange = (val?: string) => {
            const phone = val || ""
            onChange?.(phone)

            if (phone) {
                setIsValid(isValidPhoneNumber(phone))
                setIsTouched(true)
            } else {
                setIsValid(null)
                setIsTouched(false)
            }
        }

        // 3. Merge external error prop with local validation state
        const isLocalError = isTouched && isValid === false
        const hasError = !!error || isLocalError
        // If an external error is passed, display it. Otherwise fallback to default message.
        const displayError = error || "رقم غير صحيح"

        return (
            <div
                ref={ref} // Attach the ref to the root div
                className={clsx(styles.container, className)}
                dir="rtl"
                {...rest} // Spread rest props (like id, onBlur, etc.)
            >
                <div className={styles.labelWrapper}>
                    <label className={styles.label}>{label}</label>
                    <Phone className={styles.icon} />
                </div>

                {/* Apply error styles if there is an external error OR a local error */}
                <div
                    className={clsx(
                        styles.inputWrapper,
                        hasError && styles.inputError,
                        isTouched && isValid === true && !hasError && styles.inputSuccess,
                    )}
                >
                    <PhoneInput
                        international
                        defaultCountry="SA"
                        value={value}
                        onChange={handleChange}
                        className={styles.phoneInput}
                        placeholder="05X XXX XXXX"
                    />
                </div>

                {/* Status Messages */}
                <div className={styles.statusContainer}>
                    {hasError && (
                        <span className={styles.errorText}>
                            <svg viewBox="0 0 20 20" fill="currentColor" className={styles.icon}>
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {displayError}
                        </span>
                    )}
                    {isTouched && isValid === true && !hasError && (
                        <span className={styles.successText}>
                            <svg viewBox="0 0 20 20" fill="currentColor" className={styles.icon}>
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            رقم صحيح
                        </span>
                    )}
                </div>
            </div>
        )
    },
)

// Set displayName for better debugging in React DevTools
ModernPhoneInput.displayName = "ModernPhoneInput"

export default ModernPhoneInput
