import styles from "./style.module.css"
import clsx from "clsx"
import AnalyticsCard from "@/components/AnalyticsCard"
import { ClockSVG, CorrectSVG, DownArrowSVG, OrdersSVG, WrongSVG } from "@/images"
import OrdersTable from "@/components/Tables/OrdersTable"
import { getOrdersPageData } from "@/utils/db/admin"

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const params = await searchParams
    const PAGE_SIZE = 3
    const { items, totalPages } = await getOrdersPageData({
        ...params,
        pageSize: params["pageSize"] ?? PAGE_SIZE.toString(),
    })

    return (
        <div className={clsx(styles.page)}>
            <div className={styles.cards}>
                <AnalyticsCard
                    label="إجمالي الطلبات"
                    icon={OrdersSVG}
                    value={1240}
                    unit=""
                    timeUnit="أسبوع"
                    className={clsx(styles.card, styles.total)}
                />
                <AnalyticsCard
                    label="قيد التنفيذ"
                    icon={ClockSVG}
                    value={270}
                    unit=""
                    timeUnit="أسبوع"
                    className={clsx(styles.card, styles.processing)}
                />
                <AnalyticsCard
                    label="مكتملة"
                    icon={CorrectSVG}
                    value={928}
                    unit=""
                    timeUnit="أسبوع"
                    className={clsx(styles.card, styles.delivered)}
                />
                <AnalyticsCard
                    label="ملغاة"
                    icon={WrongSVG}
                    value={42}
                    unit=""
                    timeUnit="أسبوع"
                    className={clsx(styles.card, styles.cancled)}
                />
            </div>
            <OrdersTable
                initialData={items}
                initialTotalPages={totalPages}
                initialPageSize={PAGE_SIZE}
            />
        </div>
    )
}
