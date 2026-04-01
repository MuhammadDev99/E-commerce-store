// This is now a Server Component (no "use client")
import styles from "./style.module.css"
import clsx from "clsx"
import { getDisplayLanguage } from "@/utils"
import { safe } from "@/external/my-library/utils"
import { Product, RatedProduct } from "@/types"
import FullProductDisplay from "@/components/FullProductDisplay"
import { getRatedProductById } from "@/utils/db"
import ErrorDisplay from "@/components/ErrorDisplay"
import ReviewForm from "@/components/Forms/ReviewForm"

export default async function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
    // In Server Components, we await the params promise directly
    const { productId } = await params
    const decodedId = Number(decodeURIComponent(productId))

    const displayLanguage = getDisplayLanguage()

    // Fetching data directly on the server
    const productResult = await safe<RatedProduct>(getRatedProductById(decodedId))
    if (!productResult.success) {
        console.log(productResult.error)
        return <ErrorDisplay error={productResult.error} />
    }
    return (
        <div className={clsx(styles.page, styles[displayLanguage])}>
            <FullProductDisplay product={productResult.data} className={styles.productDisplay} />
        </div>
    )
}
