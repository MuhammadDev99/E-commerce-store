"use client"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import styles from "./style.module.css"
import clsx from "clsx"
import { getDisplayLanguage } from "@/utils"
import AnalyticsCard from "@/components/AnalyticsCard"
import { ClockSVG, CorrectSVG, DownArrowSVG, OrdersSVG, WrongSVG } from "@/images"
import OrdersTable from "@/components/OrdersTable"

export default function OrdersPage() {
    useSignals()
    const displayLanguage = getDisplayLanguage()
    return (
        <div className={clsx(styles.page, styles[displayLanguage])}>
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
            <OrdersTable className={styles.ordersTable} />
        </div>
    )
}
