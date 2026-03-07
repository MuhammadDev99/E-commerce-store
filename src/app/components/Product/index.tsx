import type { Product } from "@/types";
import styles from "./style.module.css";
export default function ProductDisplay({ product }: { product: Product }) {
  return (
    <div className={styles.container}>
      <p>Name:{product.name}</p>
      <p>Title:{product.title}</p>
      <p>Price:{product.price}</p>
      <img src={product.thumbnailUrl} />
    </div>
  );
}
