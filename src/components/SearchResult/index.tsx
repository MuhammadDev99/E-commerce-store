import { Product } from "@/types"
import styles from "./style.module.css"
import Image from "next/image"
import { RiyalSymbolSvg } from "@/images"
import clsx from "clsx"
import { useRouter } from "next/navigation"
import { searchSignal } from "@/signals"
export default function SearchResult({ product }: { product: Product }) {
    const router = useRouter()
    const navigateToProduct = () => {
        router.push("/product/" + product.id)
        searchSignal.value = false
    }
    const isDiscounted = product.discount > 0
    return (
        <div
            className={clsx(styles.container, isDiscounted && styles.discounted)}
            onClick={navigateToProduct}
        >
            <div className={styles.thumbnailWrapper}>
                <img src={product.images[0]} className={styles.thumbnail} />
            </div>
            <div className={styles.info}>
                <p className={styles.title}>{product.name}</p>
                <div className={styles.priceContainer}>
                    <div className={styles.price}>
                        <RiyalSymbolSvg className={styles.riyalSymbol} />
                        <p className={styles.text}>
                            {isDiscounted
                                ? product.price * (1 - product.discount / 100)
                                : product.price}
                        </p>
                    </div>
                    {isDiscounted && (
                        <div className={styles.oldPrice}>
                            <RiyalSymbolSvg className={styles.riyalSymbol} />
                            <p className={styles.text}>{product.price}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
