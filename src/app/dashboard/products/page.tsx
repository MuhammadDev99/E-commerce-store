"use client"
import { useSignals, useSignal } from "@preact/signals-react/runtime"
import styles from "./style.module.css"
import { showMessage } from "@/utils/showMessage"
import { NewProduct, Product } from "../../../types"
import { NumberInput, RadioInput, Textbox } from "@/external/my-library/components"
// 1. Import the authClient
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { safe } from "@/external/my-library/utils"
import { useSignout } from "@/utils/auth"
import ProductDisplay from "@/components/ProductDisplay"
import FullProductDisplay from "@/components/FullProductDisplay"
import Button from "@/components/Button"
import { getDisplayLanguage, getEmptyProduct } from "@/utils"
import clsx from "clsx"
import { upsertProduct } from "@/utils/db/admin"

export default function ProductsPage() {
    useSignals()
    const router = useRouter()
    const signout = useSignout()
    // 2. Get the session data
    const { data: session } = authClient.useSession()

    const product = useSignal<NewProduct>(getEmptyProduct())

    const addProduct = async () => {
        const {
            name,
            description,
            price,
            images,
            stockQuantity,
            category,
            gender,
            sizeMl,
            tags,
            discount,
        } = product.value
        // if (
        //     !title ||
        //     !description ||
        //     price <= 0 ||
        //     sizeMl <= 0 ||
        //     !stockQuantity ||
        //     stockQuantity < 0 ||
        //     !category
        // ) {
        //     showMessage("Please fill all information")
        //     return
        // }
        const result = await safe(upsertProduct(product.value))
        if (result.success) {
            showMessage({
                title: "Success",
                content: name + " added successfully",
                type: "success",
                durationMs: 3000,
            })
        } else {
            showMessage({
                title: "Error",
                content: result.error.message,
                type: "error",
                durationMs: 3000,
            })
        }
    }
    const displayLanguage = getDisplayLanguage()
    return (
        <div className={clsx(styles.page, styles[displayLanguage])}>
            <div className={styles.formContainer}>
                <div className={styles.form}>
                    <p className={styles.title}>أضف منتج</p>
                    <div className={styles.inputs}>
                        <Textbox
                            label="الاسم"
                            value={product.value.name}
                            onChange={(value) =>
                                (product.value = { ...product.value, name: value })
                            }
                        />

                        <Textbox
                            label="الوصف"
                            value={product.value.description}
                            onChange={(value) =>
                                (product.value = { ...product.value, description: value })
                            }
                        />

                        <NumberInput
                            label="السعر"
                            unit="ر.س"
                            value={product.value.price}
                            onChange={(value) =>
                                (product.value = { ...product.value, price: value })
                            }
                            max={9999}
                        />

                        <NumberInput
                            label="الكمية"
                            unit="قطعة"
                            value={product.value.stockQuantity}
                            onChange={(value) =>
                                (product.value = { ...product.value, stockQuantity: value })
                            }
                        />
                        <NumberInput
                            label="الخصم"
                            unit="%"
                            value={product.value.discount}
                            onChange={(value) =>
                                (product.value = { ...product.value, discount: value })
                            }
                        />
                        <div className={styles.gender}>
                            <p className={styles.label}>الجنس</p>
                            <div className={styles.options}>
                                <RadioInput label="رجالي" name="gender" />
                                <RadioInput label="نسائي" name="gender" />
                                <RadioInput label="للجنسين" name="gender" />
                            </div>
                        </div>
                    </div>
                    <Button type="primary" className={styles.addProductButton} onClick={addProduct}>
                        أضف المنتج
                    </Button>
                </div>
                <ProductDisplay className={styles.productDisplay} product={product.value} />
            </div>
            <FullProductDisplay
                product={{
                    ...product.value,
                    rate: 0,
                    id: product.value.id ?? 0,
                    stockQuantity: product.value.stockQuantity ?? 0,
                    discount: product.value.discount ?? 0,
                    createdAt: product.value.createdAt ?? new Date(),
                }}
                className={styles.fullProductDisplay}
            />
        </div>
    )
}
