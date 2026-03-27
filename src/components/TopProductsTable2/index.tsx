import clsx from "clsx"
import styles from "./style.module.css"
import { MOCK_PRODUCTS } from "@/mockData"
import Price from "../Price"
import Link from "next/link"
import { getProductLinkById } from "@/utils"
import PaginationButtons from "../PaginationButtons"
export default function TopProductsTable2({ className }: { className?: string }) {
    return (
        <div className={clsx(styles.root, className)}>
            <div className={styles.header}>
                <p>المنتج</p>
                <p>السعر</p>
                <p>المبيعات</p>
                <p>المخزون</p>
                <p>الإجمالي</p>
            </div>
            <div className={styles.items}>
                {MOCK_PRODUCTS.filter((x) => x.id <= 20).map((product) => {
                    // mockup value for sales
                    const salesPieces = 7 * product.stockQuantity
                    return (
                        <div key={product.id} className={styles.item}>
                            <div className={styles.product}>
                                <div className={styles.imageWrapper}>
                                    <img src={product.images[0]} className={styles.image} />
                                </div>
                                <Link
                                    href={getProductLinkById(product.id)}
                                    className={styles.title}
                                >
                                    {product.title}
                                </Link>
                            </div>
                            <Price
                                className={styles.price}
                                price={product.price}
                                discount={product.discount}
                            />
                            <p className={styles.sales}>{salesPieces} قطعة</p>
                            <p className={styles.stock}>{product.stockQuantity} قطعة</p>
                            <Price
                                price={salesPieces * product.price}
                                discount={product.discount}
                                className={styles.total}
                            />
                        </div>
                    )
                })}
            </div>
            <PaginationButtons
                className={styles.pagination}
                onPage={(id) => console.log(id)}
                selectedPage={1}
                pagesCount={200}
            />
        </div>
    )
}
