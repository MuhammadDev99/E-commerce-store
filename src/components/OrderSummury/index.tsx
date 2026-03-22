"use client"
import { useMemo } from "react"
import { Button } from "@/external/my-library/components"
import Price from "../Price"
import styles from "./style.module.css"
import clsx from "clsx"
import { Product } from "@/types"
import { TAX_PERCENTAGE } from "@/config"

export default function OrderSummary({
    className,
    products,
}: {
    products: Product[]
    className?: string
}) {
    const { subtotal, discount, tax, total } = useMemo(() => {
        const sub = products.reduce((acc, item) => acc + item.price, 0)
        const disc = products.reduce((acc, item) => acc + item.price * (item.discount / 100), 0)
        const t = (sub - disc) * TAX_PERCENTAGE
        return {
            subtotal: sub,
            discount: disc,
            tax: t,
            total: sub - disc + t,
        }
    }, [products])

    return (
        <div className={clsx(styles.root, className)}>
            <h2 className={styles.title}>ملخص الطلب</h2>

            {/* Price Breakdown Section */}
            <div className={styles.row}>
                <span className={styles.label}>مجموع المنتجات (بدون ضريبة)</span>
                <Price price={subtotal} />
            </div>

            {discount > 0 && (
                <div className={clsx(styles.row, styles.discount)}>
                    <span className={styles.label}>مجموع التخفيض</span>
                    <Price price={-discount} />
                </div>
            )}

            <div className={styles.row}>
                <span className={styles.label}>ضريبة القيمة المضافة (%{TAX_PERCENTAGE * 100})</span>
                <Price price={tax} />
            </div>

            {/* Coupon Section */}
            <div className={styles.coupon}>
                <p className={styles.label}>هل لديك كود خصم؟</p>
                <div className={styles.group}>
                    <input type="text" placeholder="أدخل كود الخصم" className={styles.input} />
                    <button className={styles.button}>إضافة</button>
                </div>
            </div>

            <hr className={styles.divider} />

            <div className={styles.total}>
                <div className={styles.row}>
                    <span className={styles.label}>الإجمالي</span>
                    <Price price={total} />
                </div>

                <Button className={styles.checkout} styleType="primary">
                    إتمام الطلب
                </Button>
            </div>
        </div>
    )
}
