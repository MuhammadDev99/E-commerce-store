import { useSignal, useSignals } from "@preact/signals-react/runtime"
import styles from "./style.module.css"
import clsx from "clsx"
import { getCartItems, getDisplayLanguage } from "@/utils"
import Price from "@/components/Price"
import { Button, Textbox } from "@/external/my-library/components"
import CartItem from "@/components/CartItem"
import { safe } from "@/external/my-library/utils"
import { Product } from "@/types"
import OrderSummury from "@/components/OrderSummury"
import EmptyCart from "@/components/EmptyCart"

export default async function Cart() {
    const displayLanguage = getDisplayLanguage()
    const cartItemsResult = await safe<Product[]>(getCartItems())
    if (!cartItemsResult.success || cartItemsResult.data.length === 0) {
        return <EmptyCart />
    }
    const items = cartItemsResult.data
    return (
        <div className={clsx(styles.page, styles[displayLanguage])}>
            <div className={styles.items}>
                {items.map((product) => {
                    return <CartItem key={product.id} product={product} />
                })}
            </div>
            <OrderSummury className={styles.orderSummury} products={items} />
        </div>
    )
}
