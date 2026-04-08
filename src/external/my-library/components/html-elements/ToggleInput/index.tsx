"use client"
import { useEffect, useState } from "react"
import styles from "../style.module.css"
import clsx from "clsx"

export default function ToggleInput({
    label,
    icon,
    startValue = false,
    onChange,
    className,
}: {
    icon?: string
    label: string
    startValue?: boolean
    onChange?: (value: boolean) => void
    className?: string
}) {
    useEffect(() => {
        setChecked(startValue)
    }, [startValue])
    const [checked, setChecked] = useState<boolean>(startValue)

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = e.target.checked
        setChecked(newValue)
        onChange?.(newValue)
    }

    return (
        <label className={clsx(styles.switchItem, className)}>
            <span className={styles.label}>
                {icon && <img src={icon} />}
                {label}
            </span>
            <input
                className={styles.hiddenInput}
                onChange={handleChange}
                type="checkbox"
                checked={!!checked}
            />
            <span className={styles.customSwitch}></span>
        </label>
    )
    /* return (
        <label className={styles.switchItem}>
            <span>{label}</span>
            <input className={styles.hiddenInput} onChange={handleChange} type="checkbox" checked={!!checked} />
            <span className={styles.customSwitch}></span>
        </label>
    ) */
}
