"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import PaginatedTable from "@/components/PaginatedTable"
import Price from "@/components/Price"
import Link from "next/link"
// Import CouponTableKey to properly type your column state
import { Coupon, CouponsTableHeader, CouponTableKey } from "@/types"
import { useState, useTransition } from "react"
import { getCouponsAdmin } from "@/utils/db"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

export default function CouponsTable({
    className,
    initialData,
    initialTotalPages,
    pageSize = 10,
    initialSearchQuery = "",
    initialSearchColumn = "code", // <--- 1. Default column
}: {
    className?: string
    initialData: Coupon[]
    initialTotalPages: number
    pageSize?: number
    initialSearchQuery?: string
    initialSearchColumn?: CouponTableKey // <--- Strongly typed
}) {
    // 2. Add state for the column
    const [coupons, setCoupons] = useState<Coupon[]>(initialData)
    const [totalPages, setTotalPages] = useState(initialTotalPages)
    const [currentPage, setCurrentPage] = useState(0)

    const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
    const [searchColumn, setSearchColumn] = useState<CouponTableKey>(initialSearchColumn)

    const [isPending, startTransition] = useTransition()

    const router = useRouter()
    const pathname = usePathname()
    const urlSearchParams = useSearchParams()

    // 3. Update fetchData to accept the column
    const fetchData = async (pageIndex: number, query: string, column: CouponTableKey) => {
        const newParams = new URLSearchParams(urlSearchParams.toString())

        // Update query in URL
        if (query) newParams.set("q", query)
        else newParams.delete("q")

        // Update column in URL
        if (column) newParams.set("col", column)
        else newParams.delete("col")

        router.replace(`${pathname}?${newParams.toString()}`, { scroll: false })

        startTransition(async () => {
            const result = await getCouponsAdmin({
                page: pageIndex + 1,
                pageSize,
                query,
                searchColumn: column, // Pass column to the DB action
            })
            setCoupons(result.items)
            setTotalPages(result.totalPages)
            setCurrentPage(pageIndex)
        })
    }

    const headers: CouponsTableHeader[] = [
        { display: "الكوبون", value: "code", searchable: true },
        { display: "الاسم", value: "name", searchable: true },
        { display: "النوع", value: "type", searchable: false },
        { display: "القيمة", value: "value", searchable: false },
        { display: "الحالة", value: "status", searchable: false },
        { display: "الاستخدام", value: "usedCount", searchable: false },
    ]
    // const headers: CouponsTableHeader[] = [
    //     { display: "الكوبون", value: "code", searchable: true },
    //     { display: "الاسم", value: "name", searchable: true },
    //     { display: "النوع", value: "type", searchable: false },
    //     { display: "القيمة", value: "value", searchable: false },
    //     { display: "الحالة", value: "status", searchable: false,sortable },
    //     { display: "الاستخدام", value: "usedCount", databaseSupport:false },
    // ]
    const items = coupons.map((coupon) => {
        const isExpired = coupon.endDate && new Date(coupon.endDate) < new Date()
        const isFull = coupon.globalUsageLimit && (coupon.usedCount ?? 0) >= coupon.globalUsageLimit
        const isActive = !isExpired && !isFull

        const typeLabel = {
            fixed: "قيمة ثابتة",
            percentage: "نسبة مئوية",
            free_shipping: "شحن مجاني",
        }[coupon.type]

        return (
            <div key={coupon.id} className={clsx(styles.item, isPending && styles.loading)}>
                <Link href={`/dashboard/marketing/coupon/${coupon.id}`} className={styles.code}>
                    {coupon.code}
                </Link>
                <p className={styles.name}>{coupon.name}</p>
                <p className={clsx(styles.type, styles[coupon.type], styles.pill)}>{typeLabel}</p>
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
    })

    return (
        <div className={clsx(styles.root, className)}>
            <PaginatedTable
                headers={headers}
                items={items}
                currentPage={currentPage}
                pagesCount={totalPages}
                // Pass both searchQuery and searchColumn on page change
                onPageChange={(p) => fetchData(p, searchQuery, searchColumn)}
                // Update BOTH local states when the user interacts with the search/dropdown
                onSearch={(q, col) => {
                    setSearchQuery(q)
                    setSearchColumn(col)
                }}
                // Fetch using BOTH states
                onSearchSubmit={() => fetchData(0, searchQuery, searchColumn)}
                gridTemplate="1.5fr 2fr 1.5fr 1fr 1fr 1fr"
            />
        </div>
    )
}
