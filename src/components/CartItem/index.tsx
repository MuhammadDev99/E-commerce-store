"use client"
import { Product } from "@/types"
import styles from "./style.module.css"
import Price from "../Price"
import { CloseSVG } from "@/images"
import { NumberInput } from "@/external/my-library/components"
import { useSignals, useSignal } from "@preact/signals-react/runtime"
export default function CartItem({ product }: { product: Product }) {
    useSignals()
    const quantity = useSignal<number>(1)
    const isDiscounted = product.discount > 0
    return (
        <div className={styles.root}>
            <CloseSVG className={styles.removeButton} />
            <div className={styles.imageWrapper}>
                <img src={product.images[0]} className={styles.image} />
            </div>

            <div className={styles.info}>
                <div className={styles.header}>
                    <div className={styles.title}>{product.title}</div>
                    <div className={styles.priceContainer}>
                        <Price
                            price={product.price}
                            discount={product.discount}
                            className={styles.price}
                        />
                        {isDiscounted && (
                            <Price
                                price={product.price}
                                className={styles.oldPrice}
                                lineThrough={isDiscounted}
                            />
                        )}
                    </div>
                </div>
                <div className={styles.footer}>
                    <NumberInput
                        label="الكمية"
                        onChange={(value) => (quantity.value = value)}
                        value={quantity.value}
                        className={styles.quantityInput}
                        min={1}
                    />
                    <div className={styles.total}>
                        <p className={styles.word}>المجموع</p>
                        <Price price={product.price * quantity.value} />
                    </div>
                </div>
            </div>
        </div>
    )
}
