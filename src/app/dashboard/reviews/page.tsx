import styles from "./style.module.css"
import clsx from "clsx"
import ReviewsTable from "@/components/Tables/ReviewsTable"
import { getReviewsPaged } from "@/utils/db/admin"

export default async function ReviewsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const params = await searchParams
    const PAGE_SIZE = 3
    const { items, totalPages } = await getReviewsPaged({
        ...params,
        pageSize: params["pageSize"] ?? PAGE_SIZE.toString(),
    })
    return (
        <div className={clsx(styles.page)}>
            <ReviewsTable
                className={styles.table}
                initialPageSize={PAGE_SIZE}
                initialData={items}
                initialTotalPages={totalPages}
            />
        </div>
    )
}
