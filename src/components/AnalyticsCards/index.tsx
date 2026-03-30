"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import AnalyticsCard from "../AnalyticsCard"
import { EyeSVG, LightningSVG, MoneySVG, OrdersSVG } from "@/images"

export default function AnalyticsCards({ className }: { className?: string }) {
    return (
        <div className={clsx(styles.cards, className)}>
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
    )
}
