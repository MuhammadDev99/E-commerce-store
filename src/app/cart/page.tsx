import { useSignal, useSignals } from "@preact/signals-react/runtime"
import styles from "./style.module.css"
import clsx from "clsx"
import { getDisplayLanguage } from "@/utils"
import Price from "@/components/Price"
import { Button, Textbox } from "@/external/my-library/components"
import CartItemDisplay from "@/components/CartItemDisplay"
import { safe } from "@/external/my-library/utils"
import { CartItem } from "@/types"
import OrderSummury from "@/components/OrderSummury"
import EmptyCart from "@/components/EmptyCart"
import { getCartItems } from "@/utils/db"

export default async function Cart() {
    const displayLanguage = getDisplayLanguage()
    const cartItemsResult = await safe<CartItem[]>(getCartItems())
    if (!cartItemsResult.success || cartItemsResult.data.length === 0) {
        return <EmptyCart />
    }
    const items = cartItemsResult.data
    return (
        <div className={clsx(styles.page, styles[displayLanguage])}>
            <div className={styles.items}>
                {items.map((product) => {
                    return <CartItemDisplay key={product.id} item={product} />
                })}
            </div>
            <OrderSummury className={styles.orderSummury} products={items} />
        </div>
    )
}
