"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import PaginatedTable from "@/components/PaginatedTable"
import { CouponStatus, MOCK_COUPONS } from "@/MockDataCoupons"
import Price from "@/components/Price"
import { assertNever } from "@/utils"
import Link from "next/link"
import { Coupon } from "@/types"
export default function CouponsTable2({
    className,
    coupons,
}: {
    coupons: Coupon[]
    className?: string
}) {
    const headers = ["الكوبون", "الاسم", "النوع", "القيمة", "الحالة", "مرات الاستخدام"]
    const items = coupons.map((coupon) => {
        const status: CouponStatus = "active"
        const value = () => {
            if (coupon.type === "fixed") {
                return <Price price={Number(coupon.value)} />
            }
            if (coupon.type === "percentage") {
                return coupon.value + "%"
            }
            if (coupon.type === "free_shipping") {
                return "شحن مجاني"
            }
            return assertNever(coupon.type)
        }
        const type = () => {
            if (coupon.type === "fixed") {
                return "قيمة ثابتة"
            }
            if (coupon.type === "percentage") {
                return "نسبة مئوية"
            }
            if (coupon.type === "free_shipping") {
                return "شحن مجاني"
            }
            return assertNever(coupon.type)
        }
        return (
            <div key={coupon.id} className={clsx(styles.item)}>
                <Link href={"/"} className={styles.code}>
                    {coupon.code}
                </Link>
                <p className={styles.name}>{coupon.name}</p>
                <p className={clsx(styles.type, styles[coupon.type], styles.pill)}>{type()}</p>
                <p className={styles.value}>{value()}</p>
                <p className={clsx(styles.status, styles[status], styles.pill)}>
                    {status === "active" ? "مفعل" : "غير مفعل"}
                </p>
                <p className={styles.usageCount}>{coupon.globalUsageLimit}</p>
            </div>
        )
    })
    return (
        <div className={clsx(styles.root, className)}>
            <PaginatedTable
                headers={headers}
                items={items}
                onPageChange={(pageNumber) => {}}
                onSearch={(query) => {}}
                onSearchSubmit={() => {}}
                pagesCount={10}
                gridTemplate="1.8fr 2.5fr  1.5fr 1.25fr  1.5fr 1fr"
            />
        </div>
    )
}
