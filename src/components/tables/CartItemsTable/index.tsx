"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import Price from "../../Price"
import Link from "next/link"
import { getProductLinkById } from "@/utils"
import PaginatedTable from "../../PaginatedTable"
import { CartItemsTableConfig, OrderItemsTableConfig } from "@/types"
import { getCartItemsPageData, getOrderItemsPaged } from "@/utils/db/admin"
export default function CartItemsTable({
    className,
    initialData,
    initialTotalPages,
    initialPageSize,
    userId,
}: {
    className?: string
    initialData: CartItemsTableConfig["row"][]
    initialTotalPages: number
    initialPageSize: number
    userId: string
}) {
    const headers: CartItemsTableConfig["headers"][] = [
        { display: "المنتج", value: "name", searchable: true, sortable: true },
        { display: "السعر", value: "price", searchable: false, sortable: true },
        { display: "الكمية", value: "quantity", searchable: false, sortable: true },
    ]

    return (
        <PaginatedTable<CartItemsTableConfig>
            className={clsx(styles.root, className)}
            headers={headers}
            initialData={initialData}
            initialTotalPages={initialTotalPages}
            defaultSearchColumn="name"
            defaultSortColumn="price"
            gridTemplate="2fr 1fr 1fr"
            pageSize={initialPageSize}
            fetchData={async (params) => await getCartItemsPageData(params, userId)}
            renderItem={({ cartItem, product }, isPending) => {
                return (
                    <div
                        key={cartItem.id}
                        className={clsx(styles.item, isPending && styles.loading)}
                    >
                        <p>{product.name}</p>
                        <Price price={product.price} />
                        <p>{cartItem.quantity}</p>
                    </div>
                )
            }}
        />
    )
}
