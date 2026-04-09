"use client"

import React, { useState } from "react"
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input"
import "react-phone-number-input/style.css"
import styles from "./style.module.css"
import clsx from "clsx"
import { Phone } from "lucide-react"

type Props = {
    value?: string
    onChange?: (value: string) => void
    label?: string
    className?: string
}

export default function ModernPhoneInput({
    className,
    value,
    onChange,
    label = "رقم الجوال",
}: Props) {
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

    return (
        <div className={clsx(styles.container, className)} dir="rtl">
            <div className={styles.labelWrapper}>
                <label className={styles.label}>{label}</label>
                <Phone className={styles.icon} />
            </div>

            {/* The wrapper changes style based on validity */}
            <div
                className={clsx(
                    styles.inputWrapper,
                    isTouched && isValid === false && styles.inputError,
                    isTouched && isValid === true && styles.inputSuccess,
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
                {isTouched && isValid === false && (
                    <span className={styles.errorText}>
                        <svg viewBox="0 0 20 20" fill="currentColor" className={styles.icon}>
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        رقم غير صحيح
                    </span>
                )}
                {isTouched && isValid === true && (
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
}
