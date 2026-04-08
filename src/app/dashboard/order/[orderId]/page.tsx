import styles from "./style.module.css"
import clsx from "clsx"
import { getDisplayLanguage } from "@/utils"
import { safe } from "@/utils/safe"
import { getOrderItemsPaged, getReviewById } from "@/utils/db/admin"
import ErrorDisplay from "@/components/ErrorDisplay"
import { Review } from "@/types"
import CustomerReview from "@/components/CustomerReview"
import OrderItemsTable from "@/components/Tables/OrderItemsTable"

export default async function CustomerOrderPage({
    params,
    searchParams,
}: {
    params: Promise<{ orderId: string }>
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const displayLanguage = getDisplayLanguage()
    const { orderId } = await params
    const decodedId = decodeURIComponent(orderId)
    if (!decodedId.trim()) {
        return (
            <ErrorDisplay
                error={new Error("Invalid Order ID")}
                title="Invalid ID"
                message="The provided order ID is invalid or empty."
            />
        )
    }

    const search = await searchParams
    const PAGE_SIZE = 3
    const { items, totalPages } = await getOrderItemsPaged(
        {
            ...params,
            pageSize: search["pageSize"] ?? PAGE_SIZE.toString(),
        },
        orderId,
    )
    return (
        <div className={clsx(styles.page)}>
            <OrderItemsTable
                className={styles.table}
                initialPageSize={PAGE_SIZE}
                initialData={items}
                initialTotalPages={totalPages}
                orderId={orderId}
            />
        </div>
    )
}
