import { Product } from "@/types"
import styles from "./style.module.css"
import ProductDisplay from "../Product"
export default function ProductsDisplay({ products }: { products: Product[] }) {
    return (
        <div className={styles.products}>
            {products.map((product) => {
                return <ProductDisplay product={product} key={product.id} />
            })}
        </div>
    )
}
