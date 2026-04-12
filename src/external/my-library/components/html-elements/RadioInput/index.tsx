"use client"
import { useState } from "react"
import styles from "../style.module.css"

export default function RadioInput({
    label,
    startValue,
    name,
    onChange,
    onClick,
}: {
    name: string
    label: string
    startValue?: boolean
    onChange?: (value: boolean) => void
    onClick?: () => void
}) {
    const [checked, setChecked] = useState<boolean>(!!startValue)
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = e.target.checked
        setChecked(newValue)
        onChange?.(newValue)
    }
    return (
        <label className={styles.radioItem} onClick={() => onClick?.()}>
            <input
                className={styles.hiddenInput}
                type="radio"
                name={name}
                checked={startValue}
                onChange={handleChange}
            />
            <span className={styles.customRadio}></span>
            <span>{label}</span>
        </label>
    )
}
