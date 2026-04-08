import clsx from "clsx"
import styles from "./style.module.css"
import { ReadonlySignal } from "@preact/signals-react"
import { NewCoupon } from "@/types" // Ensure this matches your schema type

interface CouponPreviewProps {
    className?: string
    form: ReadonlySignal<NewCoupon> // Single signal for the entire form state
}

export default function CouponPreview({ className, form }: CouponPreviewProps) {
    // Destructure values from the signal for cleaner template code
    const { name, code, type, value, enabled } = form.value

    // Helper to format the discount text
    const getDiscountDisplay = () => {
        if (type === "free_shipping") return "شحن مجاني"
        if (!value && value !== 0) return "0"
        return type === "percentage" ? `${value}%` : `${value} ر.س`
    }

    return (
        <div className={clsx(styles.previewWrapper, className)}>
            <div className={clsx(styles.couponCard, !enabled && styles.disabledCard)}>
                <div className={styles.couponHeader}>
                    <span className={styles.brandName}>{name || "اسم الحملة"}</span>

                    {/* Status Badge */}
                    <div
                        className={clsx(
                            styles.statusBadge,
                            enabled ? styles.active : styles.disabled,
                        )}
                    >
                        {enabled ? "نشط" : "معطل"}
                    </div>
                </div>

                <div className={styles.couponBody}>
                    <h2 className={styles.discountValue}>{getDiscountDisplay()}</h2>
                    <p className={styles.discountLabel}>خصم فوري عند استخدام الكود</p>
                </div>

                <div className={styles.couponFooter}>
                    <div className={styles.dashDivider} />
                    <div className={styles.codeContainer}>
                        <span className={styles.codeText}>{code || "------"}</span>
                    </div>
                </div>

                {/* Decorative circles for the ticket effect */}
                <div className={clsx(styles.circle, styles.leftCircle)} />
                <div className={clsx(styles.circle, styles.rightCircle)} />
            </div>

            {/* {!enabled && <p className={styles.disabledWarning}>كوبون معطل</p>} */}
        </div>
    )
}
