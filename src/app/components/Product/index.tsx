import type { Product } from "@/types";
import styles from "./style.module.css";
import Image from "next/image";
import { cartImg, riyalSymbolImg } from "@/images";

export default function ProductDisplay({ product }: { product: Product }) {
  // Access the first string in the images array
  const imagePath = product.images[0];

  return (
    <div className={styles.container}>
      <img className={styles.thumbnail} src={imagePath} alt={product.title} />
      <p className={styles.title}>{product.title}</p>
      <div className={styles.priceContainer}>
        <Image src={riyalSymbolImg} alt="Riyal Symbol" />
        <p className={styles.price}>{product.price}</p>
      </div>

      <button className={styles.addToCartButton}>
        Add To Cart <Image src={cartImg} alt="Add To Cart" />
      </button>
    </div>
  );
}
