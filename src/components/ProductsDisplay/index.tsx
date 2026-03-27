import { Product } from "@/types"
import styles from "./style.module.css"
import ProductDisplay from "../ProductDisplay"
import clsx from "clsx"
export default function ProductsDisplay({
    products,
    className,
}: {
    products: Product[]
    className: string
}) {
    return (
        <div className={clsx(styles.products, className)}>
            {products.map((product) => {
                return Array.from({ length: 1 }).map((x, index) => (
                    <ProductDisplay product={product} key={product.id + index} />
                ))
            })}
        </div>
    )
}
