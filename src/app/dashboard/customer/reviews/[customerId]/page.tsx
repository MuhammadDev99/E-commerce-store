import styles from "./style.module.css"
import clsx from "clsx"
import { getDisplayLanguage } from "@/utils"
import { safe } from "@/utils/safe"
import { getReviewsPageData, getUserById } from "@/utils/db"
import ErrorDisplay from "@/components/ErrorDisplay"
import CustomerProfile from "@/components/UserDisplay"
import { User } from "@/types"
import OrdersTable from "@/components/Tables/OrdersTable"
import ReviewsTable from "@/components/Tables/ReviewsTable"

export default async function CustomerReviewsPage({
    params,
    searchParams,
}: {
    params: Promise<{ customerId: string }>
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const PAGE_SIZE = 3
    const displayLanguage = getDisplayLanguage()
    const [resolvedParams, search] = await Promise.all([params, searchParams])

    const decodedId = decodeURIComponent(resolvedParams.customerId ?? "")
    if (!decodedId) {
        return <ErrorDisplay error={new Error("no customer id provided")} />
    }

    const { items, totalPages } = await getReviewsPageData(
        {
            ...search,
            pageSize: search["pageSize"] ?? PAGE_SIZE.toString(),
        },
        decodedId,
    )

    const userResult = await safe<User>(getUserById(decodedId))
    if (!userResult.success) {
        return <ErrorDisplay error={userResult.error} />
    }

    return (
        <div className={clsx(styles.page, styles[displayLanguage])}>
            <p>{userResult.data.name}</p>
            <ReviewsTable
                initialTotalPages={totalPages}
                initialData={items}
                initialPageSize={PAGE_SIZE}
                userId={decodedId}
            />
        </div>
    )
}
