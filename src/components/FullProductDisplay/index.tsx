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
    product: Partial<Product>
    className?: string
}) {
    useSignals()
    const quantity = useSignal<number>(1)
    const isDiscounted = product.discount && product.discount > 0
    const thumbnail =
        product.images && product.images.length > 0
            ? product.images[0]
            : "http://localhost:3000/images/products/midnight-musk.jpeg"
    return (
        <div className={clsx(styles.container, className)}>
            <div className={styles.imageWrapper}>
                <img src={thumbnail} className={styles.image} alt={product.title} />
            </div>

            <div className={styles.details}>
                <p className={styles.title}>{product.title}</p>
                <div className={styles.priceContainer}>
                    <Price
                        price={product.price ?? 0}
                        discount={product.discount}
                        className={styles.price}
                    />
                    {isDiscounted && (
                        <Price
                            price={product.price ?? 0}
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
                    onClick={() => {
                        if (product.id) {
                            console.log(quantity.value)
                            addItemToCart(product as Product, quantity.value)
                        } else {
                            console.error("Cannot add product without an ID")
                        }
                    }}
                />
            </div>
        </div>
    )
}
