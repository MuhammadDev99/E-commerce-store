"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { useEffect, useRef, useState } from "react"
import { clampNumber } from "../../../utils"
import { DownArrowSVG } from "../../../images/index"

export default function NumberInput({
    label,
    value = 0,
    min = 0,
    max = 100,
    className,
    onChange,
    unit = "",
}: {
    value?: number
    min?: number
    max?: number
    className?: string
    label: string
    onChange?: (value: number) => void
    unit?: string
}) {
    type StepDirection = "down" | "up"
    const [internalValue, setInternalValue] = useState<number>(value)

    useEffect(() => {
        setInternalValue(clampNumber(value, min, max))
    }, [value, min, max])

    const timerRef = useRef<ReturnType<typeof setInterval | typeof setTimeout> | null>(null)
    const stepHoldDelay = 400
    const stepInterval = 80

    const updateValue = (newValue: number) => {
        const clamped = clampNumber(newValue, min, max)
        setInternalValue(clamped)
        onChange?.(clamped)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // 1. Remove any non-numeric characters
        // 2. Remove leading zeros (unless the number is just '0')
        const rawValue = e.target.value.replace(/\D/g, "")
        const sanitizedValue = rawValue.replace(/^0+(?=\d)/, "")

        const numValue = sanitizedValue === "" ? 0 : parseInt(sanitizedValue, 10)
        updateValue(numValue)
    }

    const handleStep = (direction: StepDirection) => {
        setInternalValue((prev) => {
            const next = direction === "up" ? prev + 1 : prev - 1
            const clamped = clampNumber(next, min, max)
            onChange?.(clamped)
            return clamped
        })
    }

    const startStepping = (direction: StepDirection) => {
        clearTimer()
        handleStep(direction)
        timerRef.current = setTimeout(() => {
            timerRef.current = setInterval(() => handleStep(direction), stepInterval)
        }, stepHoldDelay)
    }

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }

    useEffect(() => {
        return clearTimer
    }, [])

    return (
        <div className={clsx(styles.numberInput, className)}>
            <div className={styles.inputAndLabel}>
                <label className={styles.label}>{label}</label>

                <div className={styles.inputWrapper}>
                    <div className={styles.unitOverlay} aria-hidden="true">
                        <span className={styles.hiddenValue}>{internalValue}</span>
                        <span className={styles.unitText}>{unit}</span>
                    </div>
                    <input
                        className={styles.input}
                        type="text"
                        inputMode="numeric"
                        onChange={handleInputChange}
                        value={internalValue}
                    />
                </div>
            </div>

            <div className={styles.controlButtons}>
                <button
                    type="button"
                    onMouseLeave={clearTimer}
                    onMouseUp={clearTimer}
                    onMouseDown={() => startStepping("up")}
                    className={styles.stepUp}
                >
                    <DownArrowSVG className={styles.arrow} />
                </button>
                <button
                    type="button"
                    onMouseLeave={clearTimer}
                    onMouseUp={clearTimer}
                    onMouseDown={() => startStepping("down")}
                    className={styles.stepDown}
                >
                    <DownArrowSVG className={styles.arrow} />
                </button>
            </div>
        </div>
    )
}
