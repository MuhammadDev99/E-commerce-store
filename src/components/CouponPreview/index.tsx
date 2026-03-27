import clsx from "clsx"
import styles from "./style.module.css"
import { ReadonlySignal } from "@preact/signals-react"

interface CouponPreviewProps {
    className?: string
    name: ReadonlySignal<string>
    code: ReadonlySignal<string>
    type: ReadonlySignal<string>
    value: ReadonlySignal<string>
}

export default function CouponPreview({ className, name, code, type, value }: CouponPreviewProps) {
    // Helper to format the discount text
    const getDiscountDisplay = () => {
        if (type.value === "free_shipping") return "شحن مجاني"
        if (!value.value) return "0"
        return type.value === "percentage" ? `${value.value}%` : `${value.value} ر.س`
    }

    return (
        <div className={clsx(styles.previewWrapper, className)}>
            <div className={styles.couponCard}>
                <div className={styles.couponHeader}>
                    <span className={styles.brandName}>{name.value || "اسم الحملة"}</span>
                </div>

                <div className={styles.couponBody}>
                    <h2 className={styles.discountValue}>{getDiscountDisplay()}</h2>
                    <p className={styles.discountLabel}>خصم فوري عند استخدام الكود</p>
                </div>

                <div className={styles.couponFooter}>
                    <div className={styles.dashDivider} />
                    <div className={styles.codeContainer}>
                        <span className={styles.codeText}>{code.value || "------"}</span>
                    </div>
                </div>

                {/* Decorative circles for the ticket effect */}
                <div className={clsx(styles.circle, styles.leftCircle)} />
                <div className={clsx(styles.circle, styles.rightCircle)} />
            </div>
        </div>
    )
}
