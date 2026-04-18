"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { useRouter } from "next/navigation"
import React, { ButtonHTMLAttributes, ElementType } from "react"

// تعريف الـ Props
interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
    variant?: "normal" | "primary" | "negative"
    loading?: boolean
    icon?: ElementType
    iconRotationDeg?: number
    flipIconOrder?: boolean
    href?: string
    htmlType?: "submit" | "button" | "reset" // أضفنا هذا السطر لحل المشكلة
}

export default function Button({
    className,
    children,
    variant = "normal",
    htmlType = "button", // القيمة الافتراضية للزر هي button
    disabled = false,
    loading = false,
    icon: Icon,
    iconRotationDeg = 0,
    flipIconOrder = false,
    onClick,
    href,
    ...props
}: ButtonProps) {
    const router = useRouter()

    const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || loading) {
            e.preventDefault()
            return
        }

        onClick?.(e)

        if (href) {
            router.push(href)
        }
    }

    const content = loading ? <p>جاري التحميل...</p> : children

    return (
        <button
            {...props}
            type={htmlType} // هنا نمرر htmlType إلى خاصية type الحقيقية للزر
            onClick={handleOnClick}
            disabled={disabled || loading}
            className={clsx(
                styles.container,
                className,
                styles[variant],
                (disabled || loading) && styles.disabled,
                loading && styles.loading,
            )}
        >
            {flipIconOrder && content}
            {Icon && (
                <Icon
                    className={styles.icon}
                    style={{ transform: `rotate(${iconRotationDeg}deg)` }}
                />
            )}
            {!flipIconOrder && content}
        </button>
    )
}
