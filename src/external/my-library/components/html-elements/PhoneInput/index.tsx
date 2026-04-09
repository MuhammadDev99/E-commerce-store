"use client"

import { useEffect, useRef, useState } from "react"
import clsx from "clsx"
import intlTelInput from "intl-tel-input"
import "intl-tel-input/build/css/intlTelInput.css"
import styles from "./style.module.css"
import { Iti } from "intl-tel-input"

type Props = {
    value?: string
    className?: string
    label?: string
    placeholder?: string // Added placeholder prop
    onChange?: (value: string) => void
    children?: React.ReactNode
}

export default function PhoneInput({
    value,
    className,
    label = "رقم الجوال", // Default Arabic Label
    placeholder = "05X XXX XXXX", // Example Arabic format placeholder
    children,
    onChange,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null)
    const itiRef = useRef<Iti | null>(null)

    const [isValid, setIsValid] = useState<boolean | null>(null)

    useEffect(() => {
        const inputElement = inputRef.current
        if (!inputElement) return

        let isMounted = true

        itiRef.current = intlTelInput(inputElement, {
            initialCountry: "auto",
            strictMode: true,
            separateDialCode: true,
            // Optimization: Use localized country names if needed
            // i18n: { sa: "المملكة العربية السعودية", ... }
            geoIpLookup: (success: (iso2: any) => void, failure: () => void) => {
                fetch("https://ipapi.co/json")
                    .then((res) => res.json())
                    .then((data) => {
                        if (isMounted) {
                            success(data.country_code.toLowerCase())
                        }
                    })
                    .catch(() => {
                        if (isMounted && typeof failure === "function") failure()
                    })
            },
            loadUtils: () => import("intl-tel-input/utils"),
        })

        if (value) {
            itiRef.current.setNumber(value)
        }

        return () => {
            isMounted = false
            itiRef.current?.destroy()
            itiRef.current = null
        }
    }, [])

    useEffect(() => {
        if (itiRef.current && value !== undefined && value !== itiRef.current.getNumber()) {
            itiRef.current.setNumber(value)
        }
    }, [value])

    const handleChange = () => {
        const instance = itiRef.current
        if (instance) {
            const isNumberValid = instance.isValidNumber()
            setIsValid(isNumberValid)
            const fullNumber = instance.getNumber()
            const cleanNumber = fullNumber.replace(/[\s\(\)\-\.]/g, "")
            onChange?.(cleanNumber)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const isNumber = /^[0-9]$/.test(e.key)
        const isControlKey = [
            "Backspace",
            "Delete",
            "ArrowLeft",
            "ArrowRight",
            "Tab",
            "Enter",
        ].includes(e.key)
        if (!isNumber && !isControlKey && !(e.ctrlKey || e.metaKey)) {
            e.preventDefault()
        }
    }

    return (
        <div className={clsx(styles.container, className)} dir="rtl">
            <label htmlFor="phone" className={styles.label}>
                {label ?? children}
            </label>

            <div className={styles.inputWrapper} dir="ltr">
                {/* 
                   Note: We wrap the input in LTR because phone numbers 
                   and the plugin UI (flags/codes) are standard LTR 
                */}
                <input
                    type="tel"
                    id="phone"
                    ref={inputRef}
                    onKeyDown={handleKeyDown}
                    onInput={handleChange}
                    className={clsx(styles.inputField)}
                    placeholder={placeholder}
                />
            </div>

            <div className={styles.statusMessage}>
                {isValid === true && <span className={styles.successText}>✓ رقم صحيح</span>}
                {isValid === false && <span className={styles.errorText}>رقم غير صحيح</span>}
            </div>
        </div>
    )
}
