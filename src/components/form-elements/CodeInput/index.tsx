"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import {
    ComponentPropsWithoutRef,
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
    KeyboardEvent,
    ClipboardEvent,
} from "react"

type Props = {
    length?: number
} & Omit<ComponentPropsWithoutRef<"div">, "onChange">

const CodeInput = forwardRef((props: Props, ref) => {
    const { length = 6, className, ...rest } = props
    const [code, setCode] = useState<string[]>(new Array(length).fill(""))
    const [error, setError] = useState<string | null>(null)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Expose value and validate methods to the parent via ref
    useImperativeHandle(ref, () => ({
        get value() {
            return code.join("")
        },
        validate: () => {
            const currentCode = code.join("")
            if (currentCode.length !== length) {
                setError(`يرجى إدخال ${length} أرقام`)
                return false
            }
            setError(null)
            return true
        },
    }))

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value
        if (!/^[0-9]*$/.test(value)) return // Only allow numbers

        const newCode = [...code]
        // Take only the last character in case of rapid typing
        newCode[index] = value.substring(value.length - 1)
        setCode(newCode)
        setError(null)

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
            setError(null)
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
        setError(null)

        // Focus on the next empty input, or the last one if full
        const focusIndex = Math.min(pastedData.length, length - 1)
        inputRefs.current[focusIndex]?.focus()
    }

    return (
        <div className={clsx(styles.root, className)} {...rest}>
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
                        className={clsx(styles.input, error && styles.inputError)}
                    />
                ))}
            </div>
            {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
    )
})

CodeInput.displayName = "CodeInput"
export default CodeInput
