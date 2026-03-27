import { RiyalSymbolSvg } from "@/images"
import styles from "./style.module.css"
import clsx from "clsx"

export default function Price({
    price,
    discount,
    className,
    lineThrough,
}: {
    price: number
    discount?: number
    className?: string
    lineThrough?: boolean
}) {
    const isDiscounted = discount && discount > 0
    const value = isDiscounted ? Math.round(price * ((100 - discount) / 100)) : price

    const wholeNumber = Math.floor(value)
    const decimalValue = Math.round((value % 1) * 100)

    // Format the whole number with dots for thousands
    // 'de-DE' (German) uses dots for thousands and commas for decimals
    const formattedWholeNumber = wholeNumber.toLocaleString("de-DE")

    return (
        <div className={clsx(styles.container, lineThrough && styles.lineThrough, className)}>
            <RiyalSymbolSvg className={styles.riyalSymbol} />
            <p className={styles.price}>
                {formattedWholeNumber}
                {decimalValue > 0 && (
                    <span className={styles.decimal}>
                        ,{decimalValue.toString().padStart(2, "0")}
                    </span>
                )}
            </p>
        </div>
    )
}
