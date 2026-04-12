"use client"

import React, {
    useState,
    forwardRef,
    useImperativeHandle,
    useRef,
    ComponentPropsWithoutRef,
} from "react"
import { isValidPhoneNumber } from "react-phone-number-input"
import ReactPhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"
import styles from "./style.module.css"
import clsx from "clsx"
import { Phone } from "lucide-react"

// Use the same interface as TextBox and SelectBox
export interface FormElementRef {
    value: string
    error: string | undefined
    validate: () => boolean
    focus: () => void
}

export interface ModernPhoneInputProps extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
    value?: string
    onChange?: (value: string) => void
    label?: string
    error?: string
}

const PhoneInput = forwardRef<FormElementRef, ModernPhoneInputProps>(
    ({ className, value, onChange, label = "رقم الجوال", error: externalError, ...rest }, ref) => {
        // 1. Internal Refs
        const containerRef = useRef<HTMLDivElement>(null)
        const [isTouched, setIsTouched] = useState(false)
        const [isValid, setIsValid] = useState<boolean | null>(null)

        // 2. Logic helpers
        const isLocalError = isTouched && isValid === false
        const hasError = !!externalError || isLocalError
        const displayError = externalError || "رقم غير صحيح"

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

        // 3. Expose methods to ProfilePage
        useImperativeHandle(ref, () => ({
            get value() {
                return value || ""
            },
            get error() {
                return hasError ? displayError : undefined
            },
            validate: () => {
                const isPhoneValid = value ? isValidPhoneNumber(value) : false
                setIsValid(isPhoneValid)
                setIsTouched(true)
                return isPhoneValid
            },
            focus: () => {
                // Scroll to the container
                containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })

                // Find the actual input element inside the third-party component and focus it
                const input = containerRef.current?.querySelector("input")
                input?.focus({ preventScroll: true })
            },
        }))

        return (
            <div
                ref={containerRef}
                className={clsx(styles.container, className)}
                dir="rtl"
                {...rest}
            >
                <div className={styles.labelWrapper}>
                    <label className={styles.label}>{label}</label>
                    <Phone className={styles.icon} />
                </div>

                <div
                    className={clsx(
                        styles.inputWrapper,
                        hasError && styles.inputError,
                        isTouched && isValid === true && !hasError && styles.inputSuccess,
                    )}
                >
                    <ReactPhoneInput
                        international
                        defaultCountry="SA"
                        value={value}
                        onChange={handleChange}
                        className={styles.phoneInput}
                        placeholder="05X XXX XXXX"
                    />
                </div>

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

PhoneInput.displayName = "ModernPhoneInput"

export default PhoneInput
