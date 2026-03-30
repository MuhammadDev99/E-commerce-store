"use client"
import type { Product, NewProduct } from "@/types"
import styles from "./style.module.css"
import { RiyalSymbolSvg } from "@/images"
import clsx from "clsx"
import { useRouter } from "next/navigation"
import AddToCart from "../AddToCart"
import { addItemToCart, getProductLinkById } from "@/utils"

interface ProductDisplayProps {
    product: Product | NewProduct
    className?: string
}

export default function ProductDisplay({ product, className }: ProductDisplayProps) {
    const router = useRouter()
    const imagePath =
        product.images?.[0] || "http://localhost:3000/images/products/midnight-musk.jpeg" // Handle potential empty images array
    const isDiscounted = product.discount && product.discount > 0

    const navigateToProduct = () => {
        if (product.id) {
            router.push(getProductLinkById(product.id))
        }
    }

    const handleAddToCart = () => {
        if (product.id !== undefined) {
            addItemToCart(product as Product)
        }
    }

    return (
        <div className={clsx(styles.container, isDiscounted && styles.discounted, className)}>
            <div className={styles.thumbnailWrapper}>
                {imagePath && (
                    <img
                        className={styles.thumbnail}
                        src={imagePath}
                        alt={product.name}
                        onClick={navigateToProduct}
                    />
                )}
            </div>

            <div className={styles.bottom}>
                <div className={styles.info}>
                    <p className={styles.title}>{product.name ?? "Product Title"}</p>

                    <div className={styles.priceContainer}>
                        <div className={styles.oldPrice}>
                            <RiyalSymbolSvg className={styles.riyalSymbol} />
                            <p className={styles.priceNumber}>{product.price}</p>
                        </div>
                        <div className={styles.price}>
                            <RiyalSymbolSvg className={styles.riyalSymbol} />
                            <p className={styles.priceNumber}>
                                {isDiscounted && product.discount
                                    ? Math.round(product.price * ((100 - product.discount) / 100))
                                    : product.price}
                            </p>
                        </div>
                    </div>
                </div>

                <AddToCart className={clsx(styles.addToCartButton2)} onClick={handleAddToCart} />
            </div>
        </div>
    )
}
