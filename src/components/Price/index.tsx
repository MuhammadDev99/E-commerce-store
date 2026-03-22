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
    return (
        <div className={clsx(styles.container, lineThrough && styles.lineThrough, className)}>
            <RiyalSymbolSvg className={styles.riyalSymbol} />
            <p className={styles.priceNumber}>
                {isDiscounted ? Math.round(price * ((100 - discount) / 100)) : price}
            </p>
        </div>
    )
}
