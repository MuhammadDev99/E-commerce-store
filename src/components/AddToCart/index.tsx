import clsx from "clsx"
import styles from "./style.module.css"
import { CartPlusSVG, CartSVG } from "@/images"
export default function AddToCart({
    className,
    onClick,
}: {
    className?: string
    onClick?: () => void
}) {
    return (
        <button className={clsx(styles.container, className)} onClick={onClick}>
            <CartSVG className={styles.icon} /> أضف للسلة
        </button>
    )
}
