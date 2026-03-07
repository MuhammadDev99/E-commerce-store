import clsx from "clsx";
import { errorImage } from "../../../media";
import styles from "../style.module.css";
import { useEffect, useRef, useState, type ReactElement } from "react";
import { clampNumber } from "../../../utils";

export default function NumberInput({
  label,
  startValue = 0,
  min = 0,
  max = 100,
  className,
  onChange,
}: {
  startValue?: number;
  min?: number;
  max?: number;
  className?: string;
  label: string;
  onChange?: (value: number) => void;
}) {
  type StepDirection = "down" | "up";
  const [value, setValue] = useState<number>(startValue);
  useEffect(() => {
    updateValue(startValue);
  }, [startValue]);

  const timerRef = useRef<ReturnType<
    typeof setInterval | typeof setTimeout
  > | null>(null);
  const stepHoldDelay = 400;
  const stepInterval = 80;
  function handleStep(direction: StepDirection) {
    setValue((previousValue) => {
      const clamped = clampNumber(
        direction === "up" ? previousValue + 1 : previousValue - 1,
        min,
        max,
      );
      return clamped;
    });
  }
  function updateValue(newValue: number) {
    const clamped = clampNumber(newValue, min, max);
    setValue(clamped);
  }

  const lastValueRef = useRef<number>(startValue);
  useEffect(() => {
    if (value !== lastValueRef.current) {
      onChange?.(value);
      lastValueRef.current = value;
    }
  }, [value, , onChange]);

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }
  function startStepping(direction: StepDirection) {
    clearTimer();
    handleStep(direction);

    timerRef.current = setTimeout(() => {
      timerRef.current = setInterval(() => {
        handleStep(direction);
      }, stepInterval);
    }, stepHoldDelay);
  }
  useEffect(() => {
    return clearTimer;
  }, []);
  return (
    <div className={clsx(styles.numberInput, className)}>
      <div className={styles.inputAndLabel}>
        <label className={styles.label}>{label}</label>
        <input
          className={styles.input}
          placeholder=" "
          type="number"
          onChange={(e) => updateValue(Number(e.target.value))}
          value={value}
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
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m18 15-6-6-6 6"></path>
          </svg>
        </button>
        <button
          type="button"
          onMouseLeave={clearTimer}
          onMouseUp={clearTimer}
          onMouseDown={() => startStepping("down")}
          className={styles.stepDown}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
