"use client"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import styles from "./style.module.css"
import clsx from "clsx"
import { getDisplayLanguage } from "@/utils"
import AnalyticsCard from "@/components/AnalyticsCard"
import { EyeSVG, LightningSVG, MoneySVG, OrdersSVG } from "@/images"
import LineChart from "@/components/LineChart"
import PieChart from "@/components/PieCart"
import { MOCK_PRODUCTS } from "@/mockData"
import Price from "@/components/Price"
import TopProductsTable from "@/components/TopProductsTable"
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

export default function AnalyticsPage() {
    useSignals()
    const displayLanguage = getDisplayLanguage()
    return (
        <div className={clsx(styles.page, styles[displayLanguage])}>
            <div className={styles.cards}>
                <AnalyticsCard
                    label="الطلبات المكتملة"
                    icon={OrdersSVG}
                    value={1240}
                    previousValue={1180}
                    unit=""
                    timeUnit="أسبوع"
                    className={clsx(styles.card, styles.orders)}
                />
                <AnalyticsCard
                    label="الزوار النشطين"
                    icon={EyeSVG}
                    value={8530}
                    previousValue={9150}
                    unit=""
                    timeUnit="أسبوع"
                    className={clsx(styles.card, styles.visitors)}
                />
                <AnalyticsCard
                    label="معدل التحويل"
                    icon={LightningSVG}
                    value={3.8}
                    previousValue={3.7}
                    unit="%"
                    timeUnit="أسبوع"
                    className={clsx(styles.card, styles.conversion)}
                />
                <AnalyticsCard
                    label="إجمالي المبيعات"
                    icon={MoneySVG}
                    value={12433}
                    previousValue={11257}
                    unit="SAR"
                    timeUnit="أسبوع"
                    className={clsx(styles.card, styles.sales)}
                />
            </div>
            <div className={styles.charts}>
                <div className={styles.visitors}>
                    <p>مصادر الزيارات</p>
                    <PieChart data={visitorsData} />
                </div>
                <div className={styles.sales}>
                    <p>مخطط المبيعات</p>
                    <LineChart
                        data={salesData}
                        unit="ر.س"
                        className={clsx(styles.chart, styles.salesChart)}
                    />
                </div>
            </div>
            <TopProductsTable className={styles.productsTable} />
        </div>
    )
}
