import styles from "./style.module.css"
import { MOCK_PRODUCTS } from "@/mockData"
import ProductsDisplay from "@/components/ProductsDisplay"
import { safe } from "@/external/my-library/utils"
import { Product } from "@/types"
import { getProducts } from "@/utils/db"

export default async function Home() {
    const productsResult = await safe<Product[]>(getProducts())
    return (
        <div className={styles.page}>
            <section className={styles.productsSection}>
                <h1>Products:</h1>
                <ProductsDisplay
                    products={productsResult.success ? productsResult.data : []}
                    className={styles.products}
                />
            </section>
        </div>
    )
}
