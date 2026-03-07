import { useState } from 'react';
import styles from '../style.module.css'
import clsx from 'clsx';

export default function TrueFalseInput({ label, startValue = false, className, onChange }: { label: string, startValue?: boolean, className?: string, onChange?: (value: boolean) => void }) {

    const [checked, setChecked] = useState<boolean>(startValue);

    function handleChange(newValue: boolean) {
        setChecked(newValue);
        onChange?.(newValue);
    }


    return (
        <div className={clsx(styles.trueFalseInput, className)}>
            <p>{label}</p>
            <div className={clsx(styles.buttons, checked ? styles.trueSelected : "")}>
                <button type='button' onClick={() => handleChange(false)} className={!checked ? styles.selected : ""}>False</button>
                <button type='button' onClick={() => handleChange(true)} className={checked ? styles.selected : ""}>True</button>
            </div>
        </div>
    )
}