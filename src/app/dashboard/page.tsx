"use client";
import { useSignals, useSignal } from "@preact/signals-react/runtime";
import styles from "./style.module.css";
import { addProductDB } from "../utils/db";
import { showMessage } from "../utils/showMessage";
import {
  getEmptyProduct,
  NewProduct,
  Product,
  ProductFormData,
} from "../../types";
import {
  NumberInput,
  RadioInput,
  Textbox,
} from "../external/my-library/components";
// 1. Import the authClient
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { safe } from "../external/my-library/utils";
import { useSignout } from "../utils/auth";

export default function DashboardPage() {
  useSignals();
  const router = useRouter();
  const signout = useSignout();
  // 2. Get the session data
  const { data: session } = authClient.useSession();

  const product = useSignal<ProductFormData>(getEmptyProduct());

  const addProduct = async () => {
    const {
      title,
      description,
      price,
      images,
      stockQuantity,
      category,
      gender,
      sizeMl,
      tags,
      discount,
    } = product.value;
    if (
      !title ||
      !description ||
      price <= 0 ||
      sizeMl <= 0 ||
      stockQuantity < 0 ||
      !category
    ) {
      showMessage("Please fill all information");
      return;
    }
    const result = await safe(addProductDB(product.value));
    if (result.success) {
      showMessage({
        title: "Success",
        content: title + " added successfully",
        type: "success",
        durationMs: 3000,
      });
    } else {
      showMessage({
        title: "Error",
        content: result.error.message,
        type: "error",
        durationMs: 3000,
      });
    }
  };

  // 3. Handle Logout

  return (
    <div className={styles.page}>
      {/* 4. User Header Section */}
      <header className={styles.header}>
        <div className={styles.userInfo}>
          {session ? (
            <p>
              Welcome, <strong>{session.user.name}</strong>
            </p>
          ) : (
            <p>Loading user...</p>
          )}
        </div>
        <button onClick={() => signout()} className={styles.logoutBtn}>
          Logout
        </button>
      </header>

      <div className={styles.addProducts}>
        <h1>Add Products</h1>
        <div className={styles.inputs}>
          <Textbox
            label="title"
            value={product.value.title}
            onChange={(value) =>
              (product.value = { ...product.value, title: value })
            }
          />

          <Textbox
            label="description"
            value={product.value.description}
            onChange={(value) =>
              (product.value = { ...product.value, description: value })
            }
          />

          <NumberInput
            label="Price"
            value={product.value.price}
            onChange={(value) =>
              (product.value = { ...product.value, price: value })
            }
          />

          <NumberInput
            label="Quantity"
            value={product.value.stockQuantity}
            onChange={(value) =>
              (product.value = { ...product.value, stockQuantity: value })
            }
          />
          <NumberInput
            label="Discount"
            value={product.value.discount}
            onChange={(value) =>
              (product.value = { ...product.value, discount: value })
            }
          />
          {/* <Textbox
            label="Category"
            value={product.value.category}
            onChange={(value) =>
              (product.value = { ...product.value, category: value })
            }
          /> */}
          <h2>Gender</h2>
          <RadioInput label="Men" name="gender" />
          <RadioInput label="Women" name="gender" />
          <RadioInput label="Unisex" name="gender" />
        </div>
        <button onClick={addProduct}>Add</button>

        <div className={styles.productList}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>Product {i + 1}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
