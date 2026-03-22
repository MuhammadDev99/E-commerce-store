import clsx from "clsx";
import styles from "./style.module.css";
type StyleType = "negative" | "positive" | "neutral" | "primary";
type ButtonSize = "small" | "medium" | "large";
type ColorTone = "normal" | "dark";
type Props = {
  children?: React.ReactNode;
  colorTone?: ColorTone;
  disabled?: boolean;
  className?: string;
  label?: string;
  size?: ButtonSize;
  styleType?: StyleType;
  onClick?: () => void;
  ref?: React.Ref<HTMLButtonElement>;
};
export default function Button({
  children,
  colorTone = "normal",
  label,
  className,
  size = "medium",
  styleType = "neutral",
  disabled,
  onClick,
  ref,
}: Props) {
  return (
    <button
      ref={ref}
      className={clsx(
        styles.button,
        className,
        styles["tone_" + colorTone],
        styles[styleType],
        styles[size],
        disabled && styles.disabled,
      )}
      onClick={onClick}
      disabled={disabled !== undefined && disabled}
    >
      {label ?? children}
    </button>
  );
}
