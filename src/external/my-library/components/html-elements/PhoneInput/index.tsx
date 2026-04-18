"use client"

import React, {
    useState,
    forwardRef,
    useImperativeHandle,
    useRef,
    ComponentPropsWithoutRef,
    useEffect,
} from "react"
import { isValidPhoneNumber, isPossiblePhoneNumber } from "react-phone-number-input"
import ReactPhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"
import styles from "./style.module.css"
import clsx from "clsx"
import { Phone } from "lucide-react"

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
    required?: boolean // Added required prop
}

const PhoneInput = forwardRef<FormElementRef, ModernPhoneInputProps>(
    (
        {
            className,
            value: externalValue,
            onChange,
            label = "رقم الجوال",
            error: externalError,
            required = false, // Default to false
            ...rest
        },
        ref,
    ) => {
        const [phoneNumber, setPhoneNumber] = useState(externalValue || "")
        const containerRef = useRef<HTMLDivElement>(null)
        const [isTouched, setIsTouched] = useState(false)
        const [isValid, setIsValid] = useState<boolean | null>(null)

        useEffect(() => {
            if (externalValue !== undefined) {
                setPhoneNumber(externalValue)
            }
        }, [externalValue])

        // Logic to determine if the field is currently invalid
        // 1. If not required and empty -> Not an error
        // 2. If required and empty -> Error
        // 3. If has text -> Check phone validity
        const checkValidity = (val: string) => {
            if (!val) {
                return !required // Valid if not required
            }
            return isValidPhoneNumber(val)
        }

        const isLocalError = isTouched && isValid === false
        const hasError = !!externalError || isLocalError
        const displayError = externalError || "رقم غير صحيح"

        const handleChange = (val?: string) => {
            const currentPhone = val || ""
            setPhoneNumber(currentPhone)
            onChange?.(currentPhone)

            if (currentPhone) {
                setIsValid(isPossiblePhoneNumber(currentPhone))
            } else {
                // If user clears the input, it's valid only if not required
                setIsValid(required ? false : null)
            }
        }

        const handleBlur = () => {
            setIsTouched(true)
            setIsValid(checkValidity(phoneNumber))
        }

        useImperativeHandle(ref, () => ({
            get value() {
                return phoneNumber || ""
            },
            get error() {
                return hasError ? displayError : undefined
            },
            validate: () => {
                const isPhoneValid = checkValidity(phoneNumber)
                setIsValid(isPhoneValid)
                setIsTouched(true)
                return isPhoneValid
            },
            focus: () => {
                containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
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
                    <label className={styles.label}>
                        {label} {required && <span className="text-red-500">*</span>}
                    </label>
                    <Phone className={styles.icon} />
                </div>

                <div
                    className={clsx(
                        styles.inputWrapper,
                        hasError && styles.inputError,
                        // Only show success if there is a value and it is valid
                        isTouched &&
                            isValid === true &&
                            phoneNumber &&
                            !hasError &&
                            styles.inputSuccess,
                    )}
                >
                    <ReactPhoneInput
                        international
                        defaultCountry="SA"
                        value={phoneNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
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
                    {/* Show "Valid Number" only if there is actual input */}
                    {isTouched && isValid === true && phoneNumber && !hasError && (
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
