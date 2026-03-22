"use client"
import { Product } from "@/types"
import styles from "./style.module.css"
import { RiyalSymbolSvg } from "@/images"
import Price from "../Price"
import clsx from "clsx"
import AddToCart from "../AddToCart"
import { NumberInput } from "@/external/my-library/components"
import { addItemToCart } from "@/utils"
import { useSignals, useSignal } from "@preact/signals-react/runtime"
export default function FullProductDisplay({
    product,
    className,
}: {
    product: Product
    className?: string
}) {
    useSignals()
    const quantity = useSignal<number>(1)
    const isDiscounted = product.discount > 0
    return (
        <div className={clsx(styles.container, className)}>
            <div className={styles.imageWrapper}>
                <img src={product.images[0]} className={styles.image} alt={product.title} />
            </div>

            <div className={styles.details}>
                <p className={styles.title}>{product.title}</p>
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
                <p className={styles.description}>{product.description}</p>
                <NumberInput
                    label="الكمية"
                    className={styles.quantity}
                    min={1}
                    value={quantity.value}
                    onChange={(value) => (quantity.value = value)}
                />
                <AddToCart
                    className={styles.addToCartButton}
                    onClick={() => addItemToCart(product, quantity.value)}
                />
            </div>
        </div>
    )
}
