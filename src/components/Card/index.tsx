import clsx from "clsx"
import styles from "./style.module.css"
import { X } from "lucide-react"
export default function Card({
    className,
    children,
    icon: Icon,
    title = "",
    onClose,
}: {
    className?: string
    children: React.ReactNode
    icon?: React.ElementType
    title?: string
    onClose?: () => void
}) {
    return (
        <div className={clsx(styles.root, className)}>
            {title && (
                <div className={styles.headerWrapper}>
                    <div className={styles.header}>
                        {Icon && <Icon className={styles.icon} />}
                        <p className={styles.title}>{title}</p>
                    </div>
                    {onClose && <X onClick={() => onClose?.()} className={styles.closeIcon} />}
                </div>
            )}
            {children}
        </div>
    )
}
