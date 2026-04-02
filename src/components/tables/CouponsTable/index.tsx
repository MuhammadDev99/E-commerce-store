"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import PaginatedTable from "@/components/PaginatedTable"
import Price from "@/components/Price"
import Link from "next/link"
import { Coupon, CouponsTableConfig } from "@/types"
import { getCoupons } from "@/utils/db"
import { getCpuponLinkById } from "@/utils"

export default function CouponsTable({
    className,
    initialData,
    initialTotalPages,
    initialPageSize,
}: {
    className?: string
    initialData: Coupon[]
    initialTotalPages: number
    initialPageSize: number
}) {
    const headers: CouponsTableConfig["headers"][] = [
        {
            display: "تاريخ الإنشاء",
            value: "createdAt",
            searchable: false,
            sortable: true,
            hidden: true,
        },
        { display: "الكوبون", value: "code", searchable: true, sortable: true },
        { display: "الاسم", value: "name", searchable: true, sortable: true },
        { display: "النوع", value: "type", searchable: false, sortable: true },
        { display: "القيمة", value: "value", searchable: false, sortable: true },
        { display: "الحالة", value: "status", searchable: false, sortable: true },
        { display: "الاستخدام", value: "usedCount", searchable: false, sortable: false },
    ]

    return (
        <div className={clsx(styles.root, className)}>
            <PaginatedTable<CouponsTableConfig>
                headers={headers}
                renderItem={(coupon, isPending) => {
                    const isExpired = coupon.endDate && new Date(coupon.endDate) < new Date()
                    const isFull =
                        coupon.globalUsageLimit &&
                        (coupon.usedCount ?? 0) >= coupon.globalUsageLimit
                    const isActive = !isExpired && !isFull

                    const typeLabel = {
                        fixed: "قيمة ثابتة",
                        percentage: "نسبة مئوية",
                        free_shipping: "شحن مجاني",
                    }[coupon.type]

                    return (
                        <div
                            key={coupon.id}
                            className={clsx(styles.item, isPending && styles.loading)}
                        >
                            <Link href={getCpuponLinkById(coupon.id)} className={styles.code}>
                                {coupon.code}
                            </Link>
                            <p className={styles.name}>{coupon.name}</p>
                            <p className={clsx(styles.type, styles[coupon.type], styles.pill)}>
                                {typeLabel}
                            </p>
                            <div className={styles.value}>
                                {coupon.type === "fixed" ? (
                                    <Price price={Number(coupon.value)} />
                                ) : coupon.type === "percentage" ? (
                                    `${coupon.value}%`
                                ) : (
                                    "—"
                                )}
                            </div>
                            <p
                                className={clsx(
                                    styles.status,
                                    styles[isActive ? "active" : "expired"],
                                    styles.pill,
                                )}
                            >
                                {isActive ? "مفعل" : "معطل"}
                            </p>
                            <p className={styles.usageCount}>
                                {coupon.usedCount} / {coupon.globalUsageLimit ?? "∞"}
                            </p>
                        </div>
                    )
                }}
                initialData={initialData}
                initialTotalPages={initialTotalPages}
                pageSize={initialPageSize}
                // Set the default fallbacks right here!
                defaultSearchColumn="code"
                defaultSortColumn="createdAt"
                defaultSortDirection="desc"
                gridTemplate="1.5fr 2fr 1.5fr 1fr 1fr 1fr"
                fetchData={async (params) => {
                    return await getCoupons(params)
                }}
            />
        </div>
    )
}
