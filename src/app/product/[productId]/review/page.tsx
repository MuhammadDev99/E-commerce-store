import styles from "./style.module.css"
import clsx from "clsx"
import { getDisplayLanguage } from "@/utils"
import ReviewForm from "@/components/Forms/ReviewForm"
import { getRatedProductById } from "@/utils/db/user"
import { RatedProduct } from "@/types"
import { safe } from "@/utils/safe"
import ErrorDisplay from "@/components/ErrorDisplay"
import Link from "next/link"

export default async function ReviewPage({ params }: { params: Promise<{ productId: string }> }) {
    const displayLanguage = getDisplayLanguage()
    const { productId } = await params
    const decodedId = Number(decodeURIComponent(productId))
    const ratedProductResult = await safe<RatedProduct>(getRatedProductById(decodedId))
    if (!ratedProductResult.success) {
        return <ErrorDisplay error={ratedProductResult.error} />
    }
    const product = ratedProductResult.data
    return (
        <div className={clsx(styles.page, styles[displayLanguage])}>
            <div className={styles.header}>
                <p className={styles.headerText}>ما تقييمك لهذا؟</p>
                <div className={styles.product}>
                    <p className={styles.name}>{product.name}</p>
                    <Link href={"/product/" + product.id} className={styles.imageWrapper}>
                        <img
                            className={styles.image}
                            src={"https://picsum.photos/id/237/200/300"}
                        />
                    </Link>
                </div>
            </div>
            <ReviewForm productId={decodedId} className={styles.form} />
        </div>
    )
}
