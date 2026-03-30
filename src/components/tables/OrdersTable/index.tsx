"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import PaginatedTable from "@/components/PaginatedTable"
import Price from "@/components/Price"
import { formatTime } from "@/utils"
import { OrdersTableConfig } from "@/types"
import { getOrdersPageData } from "@/utils/db"
import Link from "next/link"

export default function OrdersTable({
    className,
    initialData,
    initialTotalPages,
    initialPageSize,
}: {
    className?: string
    initialData: OrdersTableConfig["row"][]
    initialTotalPages: number
    initialPageSize: number
}) {
    const headers: OrdersTableConfig["headers"][] = [
        { display: "رقم الطلب", value: "orderReference", searchable: true, sortable: true },
        { display: "العميل", value: "customer", searchable: true, sortable: true },
        { display: "الإجمالي", value: "totalAmount", searchable: false, sortable: true },
        { display: "حالة الطلب", value: "status", searchable: false, sortable: true },
        { display: "التاريخ", value: "createdAt", searchable: false, sortable: true },
    ]

    return (
        <PaginatedTable<OrdersTableConfig>
            className={clsx(styles.root, className)}
            initialData={initialData}
            initialTotalPages={initialTotalPages}
            defaultSearchColumn="customer"
            defaultSortColumn="createdAt"
            gridTemplate="1.2fr 2.5fr 1fr 1fr 1fr"
            fetchData={async (params) => await getOrdersPageData(params)}
            headers={headers}
            pageSize={initialPageSize}
            renderItem={({ order, customer }, isPending) => {
                const orderStatusText = () => {
                    switch (order.status) {
                        case "paid":
                            return "مدفوع"
                        case "failed":
                            return "فشل"
                        case "pending":
                            return "معلق"
                    }
                }
                return (
                    <div
                        key={order.id}
                        className={clsx(
                            styles.item,
                            styles[order.status],
                            isPending && styles.loading,
                        )}
                    >
                        <Link href={"/"} className={clsx(styles.orderRefrence, styles.link)}>
                            {order.orderReference}
                        </Link>

                        <div className={styles.customer}>
                            <Link href={"/"} className={clsx(styles.name, styles.link)}>
                                {customer.name}
                            </Link>
                            <p className={styles.adress}>{customer.email}</p>
                        </div>

                        <Price className={styles.total} price={order.totalAmount} />

                        <p className={clsx(styles.status, styles[order.status])}>
                            {orderStatusText()}
                        </p>
                        <p className={styles.date}>
                            {formatTime(order.createdAt, "ar", {
                                showDate: true,
                                showTime: false,
                                style: "medium",
                                useWesternArabicNumerals: true,
                            })}
                        </p>
                    </div>
                )
            }}
        />
    )
}
