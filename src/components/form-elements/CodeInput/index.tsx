"use client"

import clsx from "clsx"
import styles from "./style.module.css"
import {
    ComponentPropsWithoutRef,
    forwardRef,
    useRef,
    useState,
    KeyboardEvent,
    ClipboardEvent,
} from "react"
import { FormElementRef } from "@/types"
import { useFormImperativeHandle } from "@/hooks/useFormImperativeHandle"

type Props = {
    length?: number
    validation?: (value: string) => string | undefined | null
} & Omit<ComponentPropsWithoutRef<"div">, "onChange">

const CodeInput = forwardRef<FormElementRef, Props>((props, ref) => {
    const { length = 6, className, validation, ...rest } = props

    const [code, setCode] = useState<string[]>(new Array(length).fill(""))
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // --- REUSABLE LOGIC ---
    const { internalError, setInternalError } = useFormImperativeHandle({
        ref,
        containerRef,
        // The value is the joined array of characters
        getValue: () => code.join(""),
        // Use provided validation OR a default length check
        validation:
            validation || ((val) => (val.length !== length ? `يرجى إدخال ${length} أرقام` : null)),
        // Focus the first input box when parent calls .focus()
        onFocus: () => inputRefs.current[0]?.focus({ preventScroll: true }),
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value
        if (!/^[0-9]*$/.test(value)) return // Only allow numbers

        const newCode = [...code]
        // Take only the last character in case of rapid typing
        newCode[index] = value.substring(value.length - 1)
        setCode(newCode)

        // Clear error as user types
        if (internalError) setInternalError(undefined)

        // Move to next input automatically
        if (value && index < length - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            if (!code[index] && index > 0) {
                // Move to previous input on backspace if current is empty
                inputRefs.current[index - 1]?.focus()
            }
            const newCode = [...code]
            newCode[index] = ""
            setCode(newCode)
            if (internalError) setInternalError(undefined)
        }
    }

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pastedData = e.clipboardData
            .getData("text/plain")
            .replace(/[^0-9]/g, "")
            .slice(0, length)
        if (!pastedData) return

        const newCode = [...code]
        for (let i = 0; i < pastedData.length; i++) {
            newCode[i] = pastedData[i]
        }
        setCode(newCode)
        if (internalError) setInternalError(undefined)

        // Focus on the next empty input, or the last one if full
        const focusIndex = Math.min(pastedData.length, length - 1)
        inputRefs.current[focusIndex]?.focus()
    }

    return (
        <div ref={containerRef} className={clsx(styles.root, className)} {...rest}>
            <label className={styles.label}>رمز التحقق (OTP)</label>
            <div className={styles.inputsContainer} dir="ltr">
                {code.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => {
                            inputRefs.current[index] = el
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={handlePaste}
                        className={clsx(styles.input, internalError && styles.inputError)}
                    />
                ))}
            </div>
            {internalError && <span className={styles.errorMessage}>{internalError}</span>}
        </div>
    )
})

CodeInput.displayName = "CodeInput"
export default CodeInput
