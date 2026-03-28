// components/CouponsTable/index.tsx
"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import PaginatedTable from "@/components/PaginatedTable"
import Price from "@/components/Price"
import Link from "next/link"
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
    initialSearchColumn = "code",
    initialSortColumn = "createdAt",
    initialSortDirection = "desc",
}: {
    className?: string
    initialData: Coupon[]
    initialTotalPages: number
    pageSize?: number
    initialSearchQuery?: string
    initialSearchColumn?: CouponTableKey
    initialSortColumn?: string
    initialSortDirection?: "asc" | "desc"
}) {
    const [coupons, setCoupons] = useState<Coupon[]>(initialData)
    const [totalPages, setTotalPages] = useState(initialTotalPages)
    const [currentPage, setCurrentPage] = useState(0)

    const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
    const [searchColumn, setSearchColumn] = useState<CouponTableKey>(initialSearchColumn)

    const [sortColumn, setSortColumn] = useState<string>(initialSortColumn)
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">(initialSortDirection)

    const [isPending, startTransition] = useTransition()

    const router = useRouter()
    const pathname = usePathname()
    const urlSearchParams = useSearchParams()

    const fetchData = async (
        pageIndex: number,
        query: string,
        column: CouponTableKey,
        sortCol: string,
        sortDir: "asc" | "desc",
    ) => {
        const newParams = new URLSearchParams(urlSearchParams.toString())

        if (query) newParams.set("q", query)
        else newParams.delete("q")

        if (column) newParams.set("col", column)
        else newParams.delete("col")

        if (sortCol) newParams.set("sort", sortCol)
        else newParams.delete("sort")

        if (sortDir) newParams.set("dir", sortDir)
        else newParams.delete("dir")

        router.replace(`${pathname}?${newParams.toString()}`, { scroll: false })

        startTransition(async () => {
            const result = await getCouponsAdmin({
                page: pageIndex + 1,
                pageSize,
                query,
                searchColumn: column,
                sortColumn: sortCol,
                sortDirection: sortDir,
            })
            setCoupons(result.items)
            setTotalPages(result.totalPages)
            setCurrentPage(pageIndex)
        })
    }

    const headers: CouponsTableHeader[] = [
        // ADDED: CreatedAt header - Sortable but hidden visually!
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
        { display: "الاستخدام", value: "usedCount", databaseSupport: false },
    ]

    const items = coupons.map((coupon) => {
        const isExpired = coupon.endDate && new Date(coupon.endDate) < new Date()
        const isFull = coupon.globalUsageLimit && (coupon.usedCount ?? 0) >= coupon.globalUsageLimit
        const isActive = !isExpired && !isFull

        const typeLabel = {
            fixed: "قيمة ثابتة",
            percentage: "نسبة مئوية",
            free_shipping: "شحن مجاني",
        }[coupon.type]

        // RESTORED: This returns the individual row UI
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
                onPageChange={(p) =>
                    fetchData(p, searchQuery, searchColumn, sortColumn, sortDirection)
                }
                onSearch={(q, col) => {
                    setSearchQuery(q)
                    setSearchColumn(col)
                }}
                // 3. UPDATED: Use the raw arguments (q, col) passed up, bypassing the stale state!
                onSearchSubmit={(q, col) => fetchData(0, q, col, sortColumn, sortDirection)}
                searchQuery={searchQuery}
                searchColumn={searchColumn as CouponTableKey}
                sortColumn={sortColumn as CouponTableKey}
                sortDirection={sortDirection}
                onSortChange={(col, dir) => {
                    setSortColumn(col)
                    setSortDirection(dir)
                    fetchData(0, searchQuery, searchColumn, col, dir)
                }}
                gridTemplate="1.5fr 2fr 1.5fr 1fr 1fr 1fr"
            />
        </div>
    )
}
