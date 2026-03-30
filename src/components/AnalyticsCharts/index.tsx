"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import PieChart from "../PieCart"
import LineChart from "../LineChart"

const salesData = [
    { name: "Jan", total: 2400 },
    { name: "Feb", total: 1398 },
    { name: "Mar", total: 980 },
    { name: "Apr", total: 3908 },
    { name: "May", total: 4800 },
    { name: "Jun", total: 3800 },
    { name: "Jul", total: 4300 },
]

// Inside AnalyticsPage.tsx

const visitorsData = [
    { name: "الجوال (Mobile)", value: 5400 },
    { name: "الكمبيوتر (Desktop)", value: 2100 },
    { name: "جهاز لوحي (Tablet)", value: 1030 },
]

export default function AnalyticsCharts({ className }: { className?: string }) {
    return (
        <div className={clsx(styles.charts, className)}>
            <div className={styles.visitors}>
                <p>مصادر الزيارات</p>
                <PieChart data={visitorsData} />
            </div>
            <div className={styles.sales}>
                <p>مخطط المبيعات</p>
                <LineChart data={salesData} className={clsx(styles.chart, styles.salesChart)} />
            </div>
        </div>
    )
}
