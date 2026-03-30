import styles from "./style.module.css"
import clsx from "clsx"
import CheckoutForm from "@/components/CheckoutForm"

export default function CheckoutPage() {
    return (
        <div className={clsx(styles.page)}>
            <div style={{ marginTop: "2rem" }}>
                <h1>Checkout</h1>
                {/* 2. Use it as normal */}
                <CheckoutForm />
            </div>
        </div>
    )
}
