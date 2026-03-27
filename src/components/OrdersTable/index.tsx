import clsx from "clsx"
import styles from "./style.module.css"
import { MOCK_ORDERS } from "@/MockOrderData"
import Price from "../Price"
import { formatTime } from "@/utils"
import { ClockSVG, EyeSVG, DownArrowSVG, DownArrow2SVG } from "@/images"
import Button from "../Button"
import PaginationButtons from "../PaginationButtons"
import PaginatedTable from "../PaginatedTable"
export default function OrdersTable({ className }: { className?: string }) {
    const headers = ["رقم الطلب", "العميل", "التاريخ", "الإجمالي", "حالة الطلب"]
    const items = MOCK_ORDERS.map((order) => {
        return (
            <div key={order.id} className={clsx(styles.item, styles[order.status])}>
                <p className={styles.id}>#{order.id}</p>
                <div className={styles.customer}>
                    <p className={styles.name}>
                        {order.customer.firstName} {order.customer.lastName}
                    </p>
                    <p className={styles.adress}>{order.shippingAddress.city.ar}</p>
                </div>
                <p className={styles.date}>
                    {formatTime(order.date, "ar", {
                        showDate: true,
                        showTime: false,
                        style: "medium",
                        useWesternArabicNumerals: true,
                    })}
                </p>
                <Price className={styles.total} price={order.total} />
                <p className={styles.status}>{order.status}</p>
            </div>
        )
    })
    return (
        <PaginatedTable
            className={clsx(styles.root, className)}
            headers={headers}
            items={items}
            onPageChange={(pageNumber) => {}}
            onSearch={(query) => {}}
            onSearchSubmit={() => {}}
            pagesCount={10}
            label=""
        ></PaginatedTable>
    )
}
