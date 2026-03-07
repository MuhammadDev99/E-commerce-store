import clsx from "clsx";
import styles from "./style.module.css";
import { useEffect, useState } from "react";

type StyleType = "normal" | "circle";

const easeOutCubic = (x: number): number => {
  return 1 - Math.pow(1 - x, 3);
};

export default function Progressbar({
  value,
  maxValue,
  className,
  styleType = "normal",
  fillColor = "rgb(105, 86, 255)",
  backgroundColor = "rgb(217, 211, 255)",
  strokeWidth = 10,
  fillDurationMs = 0,
}: {
  fillDurationMs?: number;
  strokeWidth?: number;
  fillColor?: string;
  backgroundColor?: string;
  styleType?: StyleType;
  className?: string;
  value: number;
  maxValue: number;
}) {
  const [displayValue, setDisplayValue] = useState<number>(
    fillDurationMs === 0 ? value : 0,
  );

  useEffect(() => {
    if (fillDurationMs > 0) {
      let frameId: number;
      let startTime: number | null = null;
      const startValue = displayValue;
      const targetValue = Math.min(value, maxValue);

      function step(timestamp: number) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = easeOutCubic(Math.min(elapsed / fillDurationMs, 1));

        // FIX: Calculate based on the difference (delta)
        const newValue = startValue + (targetValue - startValue) * progress;
        setDisplayValue(newValue);

        if (progress < 1) {
          frameId = window.requestAnimationFrame(step);
        }
      }

      frameId = window.requestAnimationFrame(step);
      return () => window.cancelAnimationFrame(frameId); // Cleanup on unmount
    }
  }, [value, maxValue, fillDurationMs]);

  // Prevent division by zero
  const safeMaxValue = maxValue <= 0 ? 1 : maxValue;

  if (styleType === "circle") {
    // FIX: Radius 90 ensures a strokeWidth of 10-20 doesn't get cut off
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const offset =
      circumference - (displayValue / safeMaxValue) * circumference;

    return (
      <svg
        className={clsx(
          styles.progressbarCircle,
          value >= maxValue && styles.full,
          className,
        )}
        viewBox="0 0 210 210"
      >
        <circle
          cx="105"
          cy="105"
          r={radius}
          fill="transparent"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx="105"
          cy="105"
          r={radius}
          fill="transparent"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transformOrigin: "center",
            transform: "rotate(-90deg)",
            transition: "none", // Ensure CSS doesn't fight the JS animation
          }}
        />
      </svg>
    );
  }

  return (
    <progress
      value={displayValue}
      max={maxValue}
      className={clsx(
        styles.progressbar,
        value >= maxValue && styles.full,
        className,
      )}
    />
  );
}
