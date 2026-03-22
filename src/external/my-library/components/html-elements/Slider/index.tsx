"use client";
import { useState } from "react";
import styles from "../style.module.css";
import clsx from "clsx";
type Props = {
  className?: string;
  label?: string;
  startValue?: number;
  onChange?: (value: number) => void;
  children?: React.ReactNode;
  min?: number;
  max?: number;
  valueLabel?: string;
};
export default function Slider({
  children,
  label,
  className,
  startValue = 0,
  onChange,
  min = 0,
  max = 100,
  valueLabel,
}: Props) {
  const [value, setValue] = useState<number>(startValue);
  const percentage = (value - min) / (max - min);
  const percentageText = `${percentage * 100}%`;
  function handleChange(value: number) {
    setValue(value);
    onChange?.(value);
  }
  return (
    <div className={clsx(styles.rangeInputContainer, className)}>
      <div className={styles.rangeInputInfo}>
        <p className={styles.label}>{label ?? children}</p>
        <p className={styles.amountText}>{valueLabel ?? `${value}%`}</p>
      </div>
      <input
        className={styles.rangeInput}
        value={value}
        onChange={(e) => handleChange(Number(e.target.value))}
        min={min}
        max={max}
        type="range"
        style={{ ["--range-progress" as any]: percentageText }}
      />
    </div>
  );
}
