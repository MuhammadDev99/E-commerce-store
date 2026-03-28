import styles from "./style.module.css"
import clsx from "clsx"
import Card from "@/components/Card"
import CouponsTable from "@/components/tables/CouponsTable"
import Button from "@/components/Button"
import { TicketSVG } from "@/images"
import { getCouponsAdmin } from "@/utils/db"
import { CouponTableKey } from "@/types"

export default async function MarketingPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    // 1. Get the query, column, and sorting details from the URL
    const params = await searchParams
    const searchQuery = params.q || ""

    // Safely cast the URL params, providing default fallbacks
    const searchColumn = (params.col as CouponTableKey) || "code"
    const sortColumn = params.sort || "createdAt"
    const sortDirection = (params.dir as "asc" | "desc") || "desc"

    // 2. Initial fetch for Page 1 with BOTH search and sorting parameters
    const PAGE_SIZE = 3
    const result = await getCouponsAdmin({
        page: 1,
        pageSize: PAGE_SIZE,
        query: searchQuery,
        searchColumn: searchColumn,
        sortColumn: sortColumn,
        sortDirection: sortDirection,
    })

    return (
        <div className={clsx(styles.page)}>
            <Card className={styles.header} title="الكوبونات" icon={TicketSVG}>
                <Button href="/dashboard/marketing/generate-coupon" type="primary">
                    إصنع كوبون
                </Button>
            </Card>

            <CouponsTable
                initialData={result.items}
                initialTotalPages={result.totalPages}
                pageSize={PAGE_SIZE}
                initialSearchQuery={searchQuery}
                initialSearchColumn={searchColumn}
                initialSortColumn={sortColumn}
                initialSortDirection={sortDirection}
            />
        </div>
    )
}
