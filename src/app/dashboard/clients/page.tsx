import styles from "./style.module.css"
import clsx from "clsx"
import ClientsTable from "@/components/Tables/ClientsTable"
import { getCustomersPageData } from "@/utils/db"

export default async function ClientsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const params = await searchParams
    const PAGE_SIZE = 3
    const { items, totalPages } = await getCustomersPageData({
        ...params,
        pageSize: params["pageSize"] ?? PAGE_SIZE.toString(),
    })

    return (
        <div className={clsx(styles.page)}>
            <ClientsTable
                initialData={items}
                initialTotalPages={totalPages}
                initialPageSize={PAGE_SIZE}
            />
        </div>
    )
}
