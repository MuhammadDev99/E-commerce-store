import clsx from "clsx";
import { errorImage } from "../../../media";
import styles from "../style.module.css";
type TextboxType = "text" | "email" | "password" | "date" | "textarea";
type Props = {
  value?: string;
  className?: string;
  label?: string;
  textboxType?: TextboxType;
  onChange?: (value: string) => void;
  children?: React.ReactNode;
};
export default function Textbox({
  children,
  label,
  className,
  value,
  textboxType = "text",
  onChange,
}: Props) {
  if (textboxType === "text") {
    return (
      <div className={clsx(styles.floatingGroup, className)}>
        <input
          value={value}
          className={styles.floatingGroupInput}
          placeholder=" "
          type="text"
          onChange={(e) => onChange?.(e.target.value)}
        />
        <label className={styles.floatingGroupLabel}>{label ?? children}</label>
      </div>
    );
  }
  if (textboxType === "email") {
    return (
      <div className={clsx(styles.floatingGroup, className)}>
        <input
          value={value}
          className={styles.floatingGroupInput}
          placeholder=" "
          type="email"
          onChange={(e) => onChange?.(e.target.value)}
        />
        <label className={styles.floatingGroupLabel}>{label ?? children}</label>
      </div>
    );
  }
  if (textboxType === "password") {
    return (
      <div className={clsx(styles.floatingGroup, className)}>
        <input
          value={value}
          className={styles.floatingGroupInput}
          placeholder=" "
          type="password"
          onChange={(e) => onChange?.(e.target.value)}
        />
        <label className={styles.floatingGroupLabel}>{label ?? children}</label>
      </div>
    );
  }
  if (textboxType === "date") {
    return (
      <div className={clsx(styles.floatingGroup, className)}>
        <input
          value={value}
          className={styles.floatingGroupInput}
          type="date"
          onChange={(e) => onChange?.(e.target.value)}
        />
        <label className={styles.floatingGroupLabel}>{label ?? children}</label>
      </div>
    );
  }
  if (textboxType === "textarea") {
    return (
      <div className={clsx(styles.floatingGroup, className, styles.textarea)}>
        <textarea
          value={value}
          className={styles.floatingGroupInput}
          placeholder=" "
          onChange={(e) => onChange?.(e.target.value)}
        ></textarea>
        <label className={styles.floatingGroupLabel}>{label ?? children}</label>
      </div>
    );
  }
  return <img src={errorImage} />;
}
