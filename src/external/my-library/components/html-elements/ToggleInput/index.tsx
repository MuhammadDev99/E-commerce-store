"use client";
import { useEffect, useState } from "react";
import styles from "../style.module.css";

export default function ToggleInput({
  label,
  icon,
  startValue = false,
  onChange,
}: {
  icon?: string;
  label: string;
  startValue?: boolean;
  onChange?: (value: boolean) => void;
}) {
  useEffect(() => {
    setChecked(startValue);
  }, [startValue]);
  const [checked, setChecked] = useState<boolean>(startValue);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.checked;
    setChecked(newValue);
    onChange?.(newValue);
  }

  return (
    <label className={styles.switchItem}>
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
  );
  /* return (
        <label className={styles.switchItem}>
            <span>{label}</span>
            <input className={styles.hiddenInput} onChange={handleChange} type="checkbox" checked={!!checked} />
            <span className={styles.customSwitch}></span>
        </label>
    ) */
}
