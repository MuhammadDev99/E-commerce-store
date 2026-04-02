import styles from "./style.module.css"
import clsx from "clsx"
import { getDisplayLanguage } from "@/utils"
import { safe } from "@/utils/safe"
import { getOrdersPageData, getUserById } from "@/utils/db"
import ErrorDisplay from "@/components/ErrorDisplay"
import CustomerProfile from "@/components/UserDisplay"
import { User } from "@/types"
import OrdersTable from "@/components/Tables/OrdersTable"

export default async function CustomerOrdersPage({
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

    const { items, totalPages } = await getOrdersPageData(
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
            <OrdersTable
                initialTotalPages={totalPages}
                initialData={items}
                initialPageSize={PAGE_SIZE}
                userId={decodedId}
            />
        </div>
    )
}
