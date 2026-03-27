import clsx from "clsx"
import styles from "./style.module.css"
export default function Card({
    className,
    children,
    icon: Icon,
    title = "",
}: {
    className?: string
    children: React.ReactNode
    icon?: React.ElementType
    title?: string
}) {
    return (
        <div className={clsx(styles.root, className)}>
            {title && (
                <div className={styles.header}>
                    {Icon && <Icon className={styles.icon} />}
                    <p className={styles.title}>{title}</p>
                </div>
            )}
            {children}
        </div>
    )
}
