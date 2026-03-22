"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { useEffect, useRef, useState, type ReactElement } from "react"
import { clampNumber } from "../../../utils"
import { DownArrowSVG } from "../../../images/index"
export default function NumberInput({
    label,
    value = 0,
    min = 0,
    max = 100,
    className,
    onChange,
}: {
    value?: number
    min?: number
    max?: number
    className?: string
    label: string
    onChange?: (value: number) => void
}) {
    type StepDirection = "down" | "up"
    const [internalValue, setInternalValue] = useState<number>(value)
    useEffect(() => {
        updateValue(value)
    }, [value])
    const timerRef = useRef<ReturnType<typeof setInterval | typeof setTimeout> | null>(null)
    const stepHoldDelay = 400
    const stepInterval = 80
    function handleStep(direction: StepDirection) {
        setInternalValue((previousValue) => {
            const clamped = clampNumber(
                direction === "up" ? previousValue + 1 : previousValue - 1,
                min,
                max,
            )
            return clamped
        })
    }
    function updateValue(newValue: number) {
        const clamped = clampNumber(newValue, min, max)
        setInternalValue(clamped)
    }
    const lastValueRef = useRef<number>(value)
    useEffect(() => {
        if (internalValue !== lastValueRef.current) {
            onChange?.(internalValue)
            lastValueRef.current = internalValue
        }
    }, [internalValue, onChange])
    function clearTimer() {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }
    function startStepping(direction: StepDirection) {
        clearTimer()
        handleStep(direction)
        timerRef.current = setTimeout(() => {
            timerRef.current = setInterval(() => {
                handleStep(direction)
            }, stepInterval)
        }, stepHoldDelay)
    }
    useEffect(() => {
        return clearTimer
    }, [])
    return (
        <div className={clsx(styles.numberInput, className)}>
            <div className={styles.inputAndLabel}>
                <label className={styles.label}>{label}</label>
                <input
                    className={styles.input}
                    placeholder=" "
                    type="number"
                    onChange={(e) => updateValue(Number(e.target.value))}
                    value={internalValue}
                    min={min}
                    max={max}
                />
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
