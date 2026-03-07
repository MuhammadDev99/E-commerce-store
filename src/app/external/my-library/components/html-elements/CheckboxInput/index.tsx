import { useState } from 'react'
import styles from '../style.module.css'
import clsx from 'clsx';

interface CheckboxProps {
    className?: string;
    label: string;
    startValue?: boolean;
    onChange?: (value: boolean) => void;
}

export default function CheckboxInput({ label, startValue = false, className, onChange }: CheckboxProps) {
    const [checked, setChecked] = useState<boolean>(startValue);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = e.target.checked;
        setChecked(newValue);
        onChange?.(newValue);
    }

    return (
        <label className={clsx(styles.checkboxItem, className)}>
            <input
                className={styles.hiddenInput}
                type="checkbox"
                checked={checked}
                onChange={handleChange}
            />
            <span className={styles.customCheckbox} ></span>
            <span className={styles.labelTitle}>{label}</span>
        </label>
    );
}