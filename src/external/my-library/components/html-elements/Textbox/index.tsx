import clsx from "clsx"
import { errorImage } from "../../../media"
import styles from "../style.module.css"
import { isArabic } from "../../../utils"
import Image from "next/image"
type TextboxType = "text" | "email" | "password" | "date" | "textarea"
type Props = {
    value?: string
    className?: string
    label?: string
    type?: TextboxType
    onChange?: (value: string) => void
    children?: React.ReactNode
}
export default function Textbox({
    children,
    label,
    className,
    value,
    type = "text",
    onChange,
}: Props) {
    const isTextArabic = label && isArabic(label)
    if (isTextArabic) className = clsx(className, styles.arabic)
    if (type === "text") {
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
        )
    }

    if (type === "email") {
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
        )
    }
    if (type === "password") {
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
        )
    }
    if (type === "date") {
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
        )
    }
    if (type === "textarea") {
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
        )
    }
    return <Image src={errorImage} alt="error" />
}
