import ProductDisplay from "./components/Product"
import styles from "./page.module.css"
import { MOCK_PRODUCTS } from "@/mockData"

export default function Home() {
    return (
        <div className={styles.page}>
            <section className={styles.productsSection}>
                <h1>Products:</h1>
                <div className={styles.products}>
                    {MOCK_PRODUCTS.map((product) => {
                        return <ProductDisplay product={product} key={product.id} />
                    })}
                </div>
            </section>
        </div>
    )
}
