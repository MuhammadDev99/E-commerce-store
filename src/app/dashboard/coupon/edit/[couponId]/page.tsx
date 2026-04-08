import styles from "./style.module.css"
import clsx from "clsx"
import CouponForm from "@/components/Forms/CouponForm"
import { getCouponById } from "@/utils/db/admin"
import { safe } from "@/utils/safe"
import { Coupon } from "@/types"
import ErrorDisplay from "@/components/ErrorDisplay"

export default async function GenerateCouponPage({
    params,
}: {
    params: Promise<{ couponId: string }>
}) {
    const { couponId } = await params
    const decodedCouponId = Number(decodeURIComponent(couponId))
    const couponResult = await safe<Coupon>(getCouponById(decodedCouponId))
    if (!couponResult.success) {
        return <ErrorDisplay error={couponResult.error} />
    }
    return (
        <div className={clsx(styles.page)}>
            <CouponForm coupon={couponResult.data} />
        </div>
    )
}
