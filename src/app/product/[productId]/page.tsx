// This is now a Server Component (no "use client")
import styles from "./style.module.css"
import clsx from "clsx"
import { getDisplayLanguage, getProductById } from "@/utils"
import { safe } from "@/external/my-library/utils"
import { Product } from "@/types"
import FullProductDisplay from "@/components/FullProductDisplay"

interface Props {
    params: Promise<{ productId: string }>
}

export default async function ProductPage({ params }: Props) {
    // In Server Components, we await the params promise directly
    const { productId } = await params
    const decodedId = Number(decodeURIComponent(productId))

    const displayLanguage = getDisplayLanguage()

    // Fetching data directly on the server
    const productResult = await safe<Product>(getProductById(decodedId))

    return (
        <div className={clsx(styles.page, styles[displayLanguage])}>
            {productResult.success && (
                <FullProductDisplay
                    product={productResult.data}
                    className={styles.productDisplay}
                />
            )}
        </div>
    )
}
