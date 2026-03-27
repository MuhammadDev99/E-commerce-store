"use client"

import { CartItem } from "@/types"
import styles from "./style.module.css"
import Price from "../Price"
import { CloseSVG } from "@/images"
// import { NumberInput } from "@/external/my-library/components"
import { useSignals, useSignal } from "@preact/signals-react/runtime"
import { updateCartItemQuantityDB, removeItemFromCartDB, getCartCount } from "@/utils/db"
import { cartCountSignal } from "@/signals"
import { useRouter } from "next/navigation"
import { startTransition } from "react" // 1. Import startTransition
import NumberInput from "../form-elements/NumberInput"

export default function CartItemDisplay({ item }: { item: CartItem }) {
    useSignals()
    const router = useRouter()
    const quantity = useSignal<number>(item.quantity)
    const isDiscounted = item.discount > 0
    const unitPrice = isDiscounted ? item.price - item.price * (item.discount / 100) : item.price
    const onQuantityChange = (newQuantity: number) => {
        startTransition(async () => {
            const oldQuantity = quantity.value
            quantity.value = newQuantity

            try {
                await updateCartItemQuantityDB(item.id, newQuantity)
                const freshCount = await getCartCount()
                cartCountSignal.value = freshCount

                // ADD THIS LINE: Tells the server to re-fetch the cart items
                router.refresh()
            } catch (error) {
                console.error("Failed to update quantity:", error)
                quantity.value = oldQuantity
            }
        })
    }
    const onRemoveItem = () => {
        // Wrap removal in transition as well
        startTransition(async () => {
            try {
                await removeItemFromCartDB(item.id)
                const freshCount = await getCartCount()
                cartCountSignal.value = freshCount
                router.refresh()
            } catch (error) {
                console.error("Failed to remove item:", error)
            }
        })
    }

    return (
        <div className={styles.root}>
            <CloseSVG className={styles.removeButton} onClick={onRemoveItem} />

            <div className={styles.imageWrapper}>
                <img src={item.images[0]} className={styles.image} alt={item.title} />
            </div>

            <div className={styles.info}>
                <div className={styles.header}>
                    <div className={styles.title}>{item.title}</div>
                    <div className={styles.priceContainer}>
                        <Price price={unitPrice} className={styles.price} />
                        {isDiscounted && (
                            <Price
                                price={item.price}
                                className={styles.oldPrice}
                                lineThrough={true}
                            />
                        )}
                    </div>
                </div>

                <div className={styles.footer}>
                    {/* <NumberInput
                        label="الكمية"
                        onChange={(value) => onQuantityChange(value)}
                        value={quantity.value}
                        className={styles.quantityInput}
                        min={1}
                    /> */}
                    <NumberInput
                        label="الكمية"
                        onChange={(e) => onQuantityChange(Number(e.target.value))}
                        value={quantity.value}
                        className={styles.quantityInput}
                        unit="قطعة"
                        min={1}
                        max={100}
                    />
                    <div className={styles.total}>
                        <p className={styles.word}>المجموع</p>
                        <Price price={unitPrice * quantity.value} />
                    </div>
                </div>
            </div>
        </div>
    )
}
