import { useState } from 'react'
import styles from '../style.module.css'

export default function RadioInput({ label, startValue, name, onChange }: { name: string, label: string, startValue?: boolean, onChange?: (value: boolean) => void }) {
    const [checked, setChecked] = useState<boolean>(!!startValue)
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = e.target.checked
        setChecked(newValue)
        onChange?.(newValue)
    }
    return (
        <label className={styles.radioItem}>
            <input className={styles.hiddenInput} type="radio" name={name} checked={startValue} onChange={handleChange} />
            <span className={styles.customRadio}></span>
            <span >{label}</span>
        </label>
    )
}