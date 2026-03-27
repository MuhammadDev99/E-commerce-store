"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { useRouter } from "next/navigation"

export default function Button({
    className,
    children,
    type = "normal",
    disabled = false,
    icon: Icon,
    iconRotationDeg = 0,
    flipIconOrder = false,
    onClick,
    href,
}: {
    className?: string
    children?: React.ReactNode
    type?: "normal" | "primary" | "negative"
    disabled?: boolean
    icon?: React.ElementType
    iconRotationDeg?: number
    onClick?: () => void
    flipIconOrder?: boolean
    href?: string
}) {
    const router = useRouter()
    const handleOnClick = () => {
        onClick?.()
        if (href) {
            router.push(href)
        }
    }
    return (
        <button
            onClick={handleOnClick}
            disabled={disabled}
            className={clsx(styles.container, className, styles[type], disabled && styles.disabled)}
        >
            {flipIconOrder && children}
            {Icon && (
                <Icon
                    className={styles.icon}
                    style={{ transform: `rotate(${iconRotationDeg}deg)` }}
                />
            )}
            {!flipIconOrder && children}
        </button>
    )
}
