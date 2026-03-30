import styles from "./style.module.css"
import clsx from "clsx"

export default function CheckoutPage() {
    return (
        <div className={clsx(styles.page)}>
            <div style={{ marginTop: "2rem" }}>
                <h1>Checkout</h1>
            </div>
        </div>
    )
}
