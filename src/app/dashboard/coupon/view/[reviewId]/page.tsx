import styles from "./style.module.css"
import clsx from "clsx"
import { getDisplayLanguage } from "@/utils"
import { safe } from "@/utils/safe"
import { getCouponById } from "@/utils/db/admin"
import ErrorDisplay from "@/components/ErrorDisplay"
import CouponDisplay from "@/components/CouponDisplay"

export default async function CouponPage({ params }: { params: Promise<{ reviewId: string }> }) {
    const { reviewId } = await params
    const decodedId = decodeURIComponent(reviewId)
    if (!decodedId.trim()) {
        return (
            <ErrorDisplay
                error={new Error("Invalid Coupon ID")}
                title="Invalid ID"
                message="The provided coupon ID is invalid or empty."
            />
        )
    }
    const displayLanguage = getDisplayLanguage()

    // 1. Fetch User
    const result = await safe(getCouponById(Number(decodedId)))
    if (!result.success) {
        return <ErrorDisplay error={result.error} />
    }
    const coupon = result.data

    return (
        <div className={clsx(styles.page, styles[displayLanguage])}>
            <CouponDisplay className={styles.display} coupon={coupon} />
        </div>
    )
}
