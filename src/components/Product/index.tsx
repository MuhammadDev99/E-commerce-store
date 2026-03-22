"use client"
import type { Product } from "@/types"
import styles from "./style.module.css"
import Image from "next/image"
import { cartImg, riyalSymbolImg, RiyalSymbolSvg } from "@/images"
import clsx from "clsx"
import { useRouter } from "next/navigation"
import AddToCart from "../AddToCart"
import { addItemToCart } from "@/utils"

export default function ProductDisplay({ product }: { product: Product }) {
    const router = useRouter()
    const imagePath = product.images[0]
    const isDiscounted = product.discount > 0
    const navigateToProduct = () => {
        router.push("/product/" + product.id)
    }
    return (
        <div className={clsx(styles.container, isDiscounted && styles.discounted)}>
            <div className={styles.thumbnailWrapper}>
                <img
                    className={styles.thumbnail}
                    src={imagePath}
                    alt={product.title}
                    onClick={navigateToProduct}
                />
            </div>

            <div className={styles.bottom}>
                <div className={styles.info}>
                    <p className={styles.title}>{product.title}</p>

                    <div className={styles.priceContainer}>
                        <div className={styles.oldPrice}>
                            <RiyalSymbolSvg className={styles.riyalSymbol} />
                            <p className={styles.priceNumber}>{product.price}</p>
                        </div>
                        <div className={styles.price}>
                            <RiyalSymbolSvg className={styles.riyalSymbol} />
                            <p className={styles.priceNumber}>
                                {isDiscounted
                                    ? Math.round(product.price * ((100 - product.discount) / 100))
                                    : product.price}
                            </p>
                        </div>
                    </div>
                </div>

                {/* <button className={styles.addToCartButton}>
                    أضف للسلة
                    <Image src={cartImg} alt="أضف للسلة" />
                </button> */}
                <AddToCart
                    className={styles.addToCartButton2}
                    onClick={() => addItemToCart(product)}
                />
            </div>
        </div>
    )
}
