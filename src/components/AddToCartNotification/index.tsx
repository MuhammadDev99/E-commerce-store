"use client"
import { useRef } from "react"
import clsx from "clsx"
import styles from "./style.module.css"
import Price from "../Price"
import { CartSVG, CorrectSVG, CreditCardSVG } from "@/images"
import { Button } from "@/external/my-library/components"
import { useSignals } from "@preact/signals-react/runtime"
import { addedItemSignal } from "@/signals"
import { Product } from "@/types"

export default function AddToCartNotification({ className }: { className?: string }) {
    useSignals()

    const lastProductRef = useRef<Product | null>(null)

    if (addedItemSignal.value) {
        lastProductRef.current = addedItemSignal.value
    }

    const product = addedItemSignal.value ?? lastProductRef.current
    const isVisible = Boolean(addedItemSignal.value)

    return (
        <div className={clsx(styles.container, className, isVisible ? styles.show : "")}>
            {/* ONLY render the inside if we have a product */}
            {product && (
                <>
                    <div className={styles.header}>
                        <p>
                            تمت إضافة <span className={styles.title}>{product.name}</span> بنجاح
                        </p>
                        <CorrectSVG className={styles.icon} />
                    </div>
                    <div className={styles.content}>
                        <div>
                            <img src={product.images?.[0]} alt={product.name} />
                            <div className={styles.info}>
                                <p>{product.name}</p>
                                <div className={styles.priceContainer}>
                                    <Price
                                        className={styles.price}
                                        price={
                                            product.discount > 0
                                                ? product.price * ((100 - product.discount) / 100)
                                                : product.price
                                        }
                                    />
                                    {product.discount > 0 && (
                                        <Price
                                            price={product.price}
                                            lineThrough={true}
                                            className={styles.oldPrice}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={styles.buttons}>
                            <Button styleType="primary">
                                إتمام الطلب <CreditCardSVG className={styles.icon} />
                            </Button>
                            <Button>
                                عرض السلة <CartSVG className={styles.icon} />
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
