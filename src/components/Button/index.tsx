"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { useRouter } from "next/navigation"

export default function Button({
    className,
    children,
    type = "normal",
    disabled = false,
    loading = false, // Added loading prop with default value
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
    loading?: boolean // Added to types
    icon?: React.ElementType
    iconRotationDeg?: number
    onClick?: () => void
    flipIconOrder?: boolean
    href?: string
}) {
    const router = useRouter()

    const handleOnClick = () => {
        // Prevent action if disabled or loading
        if (disabled || loading) return

        onClick?.()
        if (href) {
            router.push(href)
        }
    }
    if (loading) children = <p>جاري التحميل...</p>
    return (
        <button
            onClick={handleOnClick}
            disabled={disabled || loading} // Disable HTML button when loading
            className={clsx(
                styles.container,
                className,
                styles[type],
                (disabled || loading) && styles.disabled,
                loading && styles.loading, // Add loading CSS class for styling
            )}
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
