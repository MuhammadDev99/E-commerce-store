import clsx from "clsx"
import styles from "./style.module.css"
import { UpArrowZigzagSVG } from "@/images"

interface AnalyticsCardProps {
    className?: string
    label: string
    value: number
    previousValue?: number
    unit?: string
    timeUnit?: "أسبوع" | "شهر" | "يوم" | "سنة"
    higherBetter?: boolean
    icon: React.ElementType
}

export default function AnalyticsCard({
    label,
    value,
    previousValue,
    unit = "",
    timeUnit = "شهر",
    higherBetter = true,
    className,
    icon: Icon,
}: AnalyticsCardProps) {
    let percentDiffernce = 0
    if (previousValue) {
        percentDiffernce = ((value - previousValue) / previousValue) * 100
    }

    const isPositive = percentDiffernce >= 0
    const isSuccess = higherBetter ? isPositive : !isPositive

    return (
        <div className={clsx(styles.container, className)}>
            <div className={styles.header}>
                <div className={styles.headerMain}>
                    <div className={styles.textGroup}>
                        <p className={styles.title}>{label}</p>
                        <p className={styles.value}>
                            <span className={styles.unit}>{unit}</span> {value.toLocaleString()}
                        </p>
                    </div>
                    <div className={styles.iconWrapper}>
                        <Icon className={styles.icon} />
                    </div>
                </div>
            </div>

            {previousValue && (
                <div className={styles.footer}>
                    <div
                        className={clsx(
                            styles.trendBadge,
                            isSuccess ? styles.success : styles.danger,
                        )}
                    >
                        <UpArrowZigzagSVG
                            className={clsx(styles.trendIcon, !isPositive && styles.rotate)}
                        />
                        <p className={styles.trendPercentage}>
                            {Math.abs(percentDiffernce).toFixed(1)}%
                        </p>
                    </div>
                    <p className={styles.comparisonText}>مقارنة بال{timeUnit} الماضي</p>
                </div>
            )}
        </div>
    )
}
