import clsx from "clsx";
import styles from "../style.module.css";
type Props = {
  startValue?: string;
  className?: string;
  label: string;
  options: Array<{ text: string; value: string }>;
  onChange?: (value: string) => void;
};
export default function Dropdown({
  label,
  options,
  startValue,
  className,
  onChange,
}: Props) {
  return (
    <div className={clsx(styles.floatingGroup, className)}>
      <select
        className={clsx(styles.floatingGroupInput, styles.selectBox)}
        defaultValue={startValue ?? ""}
        required
        onChange={(e) => onChange?.(e.target.value)}
      >
        <option
          value=""
          disabled
          hidden
        ></option>
        {options.map((option, index) => {
          return (
            <option
              value={option.value}
              key={index}
            >
              {option.text}
            </option>
          );
        })}
      </select>
      <label className={styles.floatingGroupLabel}>{label}</label>
    </div>
  );
}
