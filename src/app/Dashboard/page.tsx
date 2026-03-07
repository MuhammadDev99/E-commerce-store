"use client";
import { useSignals, useSignal } from "@preact/signals-react/runtime";
import styles from "./style.module.css";
import { addProductDB } from "@/db/utils";
import { showMessage } from "../utils/showMessage";
import { Product } from "../../types";
import { NumberInput, Textbox } from "../external/my-library/components";
export default function DashboardPage() {
  useSignals();
  const product = useSignal<Product>({
    title: "",
    name: "",
    price: 0,
    thumbnailUrl: "",
    id: 0,
  });
  const addProduct = () => {
    console.log("clicked");
    const { title, name } = product.value;
    if (!title || !name) {
      showMessage("Please fill title and name");
      return;
    }
    showMessage({
      title: "Success",
      content: name + " added successfully",
      type: "success",
      durationMs: 3000,
    });

    addProductDB(product.value);
  };
  return (
    <div className={styles.page}>
      <div className={styles.addProducts}>
        <h1>Add Products</h1>
        <div className={styles.inputs}>
          <Textbox
            label="title"
            onChange={(value) =>
              (product.value = { ...product.value, title: value })
            }
          />

          <Textbox
            label="name"
            onChange={(value) =>
              (product.value = { ...product.value, title: value })
            }
          />

          <NumberInput
            label="Price"
            onChange={(value) =>
              (product.value = { ...product.value, price: value })
            }
          />
        </div>
        <button onClick={addProduct}>Add</button>
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i}>Product {i + 1}</div>
        ))}
      </div>
    </div>
  );
}
