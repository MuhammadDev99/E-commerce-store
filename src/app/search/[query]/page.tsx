import { getDisplayLanguage, searchProducts } from "@/utils"
import { Product } from "@/types"
import { safe } from "@/external/my-library/utils"
import ProductsDisplay from "@/components/ProductsDisplay"
import styles from "./style.module.css"
import clsx from "clsx"

type Props = {
    params: Promise<{ query: string }>
}

export default async function SearchPage({ params }: Props) {
    // 1. Get the query from the URL (Next.js 15 requires awaiting params)
    const { query } = await params

    // 2. Decode the URI (for Arabic characters)
    const decodedQuery = decodeURIComponent(query)

    // 3. Fetch data on the server
    const displayLanguage = getDisplayLanguage()
    const searchResult = await safe<Product[]>(searchProducts(decodedQuery))

    return (
        <div className={clsx(styles.page, styles[displayLanguage])}>
            {searchResult.success && <ProductsDisplay products={searchResult.data} />}
        </div>
    )
}
