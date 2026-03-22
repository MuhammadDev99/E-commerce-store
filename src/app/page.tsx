import styles from "./page.module.css"
import { MOCK_PRODUCTS } from "@/mockData"
import ProductsDisplay from "@/components/ProductsDisplay"

export default function Home() {
    return (
        <div className={styles.page}>
            <section className={styles.productsSection}>
                <h1>Products:</h1>
                <ProductsDisplay products={MOCK_PRODUCTS} />
            </section>
        </div>
    )
}
