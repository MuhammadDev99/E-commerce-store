"use client"

import { useState } from "react"
import { Product, RatedProduct } from "@/types"
import styles from "./style.module.css"
import Price from "../Price"
import clsx from "clsx"
import AddToCart from "../AddToCart"
import { addItemToCart } from "@/utils"
import ReviewStars from "../ReviewStars"
import NumberInput from "../form-elements/NumberInput"
import Button from "../Button"
import { useRouter } from "next/navigation"

export default function FullProductDisplay({
    product,
    className,
}: {
    product: RatedProduct
    className?: string
}) {
    const router = useRouter()

    // Use React useState instead of signals to avoid the rendering conflict
    const [quantity, setQuantity] = useState<number>(1)

    const isDiscounted = product.discount && product.discount > 0

    // Fallback image logic
    const thumbnail =
        product.images && product.images.length > 0
            ? product.images[0]
            : "http://localhost:3000/images/products/midnight-musk.jpeg"

    return (
        <div className={clsx(styles.container, className)}>
            <div className={styles.imageWrapper}>
                <img src={thumbnail} className={styles.image} alt={product.name} />
            </div>

            <div className={styles.details}>
                <p className={styles.title}>{product.name}</p>

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

                <ReviewStars rating={product.rate ?? 0} className={styles.stars} />

                <p className={styles.description}>{product.description}</p>

                {/* Quantity Input */}
                <div className={styles.quantityWrapper}>
                    <NumberInput
                        label="الكمية"
                        className={styles.quantity}
                        min={1}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                </div>

                <div className={styles.actionButtons}>
                    <AddToCart
                        className={styles.addToCartButton}
                        onClick={() => {
                            if (product.id) {
                                // Use the state variable directly
                                addItemToCart(product as Product, quantity)
                            } else {
                                console.error("Cannot add product without an ID")
                            }
                        }}
                    />
                    <Button
                        className={styles.addReviewButton}
                        onClick={() => router.push(`/product/${product.id}/review`)}
                    >
                        أضف تقييمك
                    </Button>
                </div>
            </div>
        </div>
    )
}
