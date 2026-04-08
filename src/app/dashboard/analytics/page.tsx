import styles from "./style.module.css"
import clsx from "clsx"
import TopProductsTable from "@/components/Tables/TopProductsTable"
import { getProductsAnalticsPaged } from "@/utils/db/admin"
import AnalyticsCards from "@/components/AnalyticsCards"
import AnalyticsCharts from "@/components/AnalyticsCharts"

export default async function AnalyticsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const params = await searchParams
    const PAGE_SIZE = 3
    const { items, totalPages } = await getProductsAnalticsPaged({
        ...params,
        pageSize: params["pageSize"] ?? PAGE_SIZE.toString(),
    })

    return (
        <div className={clsx(styles.page)}>
            <AnalyticsCards className={styles.cards} />
            <AnalyticsCharts className={styles.charts} />
            <TopProductsTable
                className={styles.productsTable}
                initialData={items}
                initialTotalPages={totalPages}
            />
        </div>
    )
}
