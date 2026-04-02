"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import Price from "../../Price"
import Link from "next/link"
import { getProductLinkById } from "@/utils"
import PaginatedTable from "../../PaginatedTable"
import { OrderItemsTableConfig } from "@/types"
import { getOrderItemsPageData } from "@/utils/db"
export default function OrderItemsTable({
    className,
    initialData,
    initialTotalPages,
    initialPageSize,
    orderId,
}: {
    className?: string
    initialData: OrderItemsTableConfig["row"][]
    initialTotalPages: number
    initialPageSize: number
    orderId: string
}) {
    const headers: OrderItemsTableConfig["headers"][] = [
        { display: "المنتج", value: "name", searchable: true, sortable: true },
        { display: "السعر", value: "priceAtPurchase", searchable: false, sortable: true },
        { display: "الكمية", value: "quantity", searchable: false, sortable: true },
    ]

    return (
        <PaginatedTable<OrderItemsTableConfig>
            className={clsx(styles.root, className)}
            headers={headers}
            initialData={initialData}
            initialTotalPages={initialTotalPages}
            defaultSearchColumn="name"
            defaultSortColumn="priceAtPurchase"
            gridTemplate="2fr 1fr 1fr"
            pageSize={initialPageSize}
            fetchData={async (params) => await getOrderItemsPageData(params, orderId)}
            renderItem={({ item, product }, isPending) => {
                return (
                    <div key={item.id} className={clsx(styles.item, isPending && styles.loading)}>
                        <p>{product.name}</p>
                        <Price price={item.priceAtPurchase} />
                        <p>{item.quantity}</p>
                    </div>
                )
            }}
        />
    )
}
