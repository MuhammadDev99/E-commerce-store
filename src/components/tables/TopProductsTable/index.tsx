"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import Price from "../../Price"
import Link from "next/link"
import { getProductLinkById } from "@/utils"
import PaginatedTable from "../../PaginatedTable"
import { ProductsAnalyticsTableConfig } from "@/types"
import { getProductsAnalyticsAdmin } from "@/utils/db"
export default function TopProductsTable({
    className,
    initialData,
    initialTotalPages,
}: {
    className?: string
    initialData: ProductsAnalyticsTableConfig["row"][]
    initialTotalPages: number
}) {
    const headers: ProductsAnalyticsTableConfig["headers"][] = [
        {
            display: "تاريخ الإنشاء",
            value: "createdAt",
            searchable: false,
            sortable: true,
            hidden: true,
        },
        { display: "المنتج", value: "name", searchable: true, sortable: true },
        { display: "السعر", value: "price", searchable: false, sortable: true },
        { display: "المبيعات", value: "totalOrdered", searchable: false, sortable: true },
        { display: "المخزون", value: "stockQuantity", searchable: false, sortable: true },
        { display: "الإجمالي", value: "totalRevenue", searchable: false, sortable: true },
    ]

    return (
        <PaginatedTable<ProductsAnalyticsTableConfig>
            className={clsx(styles.root, className)}
            headers={headers}
            initialData={initialData}
            initialTotalPages={initialTotalPages}
            defaultSearchColumn="name"
            defaultSortColumn="createdAt"
            gridTemplate="2fr 1fr 1fr 1fr 1fr"
            fetchData={async (params) => await getProductsAnalyticsAdmin(params)}
            renderItem={(product, isPending) => {
                return (
                    <div
                        key={product.id}
                        className={clsx(styles.item, isPending && styles.loading)}
                    >
                        <div className={styles.product}>
                            <div className={styles.imageWrapper}>
                                <img src={product.images[0]} className={styles.image} />
                            </div>
                            <Link href={getProductLinkById(product.id)} className={styles.title}>
                                {product.name}
                            </Link>
                        </div>
                        <Price
                            className={styles.price}
                            price={product.price}
                            discount={product.discount}
                        />
                        <p className={styles.sales}>{product.totalOrdered} قطعة</p>
                        <p className={styles.stock}>{product.stockQuantity} قطعة</p>
                        <Price price={product.totalRevenue} className={styles.total} />
                    </div>
                )
            }}
        />
    )
}
