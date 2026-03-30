// This is now a Server Component (no "use client")
import styles from "./style.module.css"
import clsx from "clsx"
import { getDisplayLanguage } from "@/utils"
import { safe } from "@/external/my-library/utils"
import { Product } from "@/types"
import FullProductDisplay from "@/components/FullProductDisplay"
import { getProductById } from "@/utils/db"
import ErrorDisplay from "@/components/ErrorDisplay"

export default async function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
    // In Server Components, we await the params promise directly
    const { productId } = await params
    const decodedId = Number(decodeURIComponent(productId))

    const displayLanguage = getDisplayLanguage()

    // Fetching data directly on the server
    const productResult = await safe<Product>(getProductById(decodedId))
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
