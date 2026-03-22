import clsx from "clsx"
import styles from "./style.module.css"
import { MOCK_ORDERS } from "@/MockOrderData"
import Price from "../Price"
import { formatTime } from "@/utils"
import { ClockSVG, EyeSVG, DownArrowSVG, DownArrow2SVG } from "@/images"
import Button from "../Button"
export default function OrdersTable({ className }: { className?: string }) {
    return (
        <div className={clsx(styles.root, className)}>
            <div className={styles.header}>
                <p>رقم الطلب</p>
                <p>العميل</p>
                <p>التاريخ</p>
                <p>الإجمالي</p>
                <p>حالة الطلب</p>
            </div>
            <div className={styles.items}>
                {MOCK_ORDERS.map((order) => {
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
                })}
            </div>
            <div className={styles.pagination}>
                <Button icon={DownArrow2SVG} iconRotationDeg={-90}>
                    السابق
                </Button>
                <Button>1</Button>
                <Button type="primary">2</Button>
                <Button>3</Button>
                <Button>4</Button>
                <Button icon={DownArrow2SVG} iconRotationDeg={90} flipIconOrder={true}>
                    التالي
                </Button>
            </div>
        </div>
    )
}
