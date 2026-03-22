"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { Button } from "@/external/my-library/components"
import { EmptyCartSVG } from "@/images"
import { useRouter } from "next/navigation"
export default function EmptyCart({ className }: { className?: string }) {
    const router = useRouter()
    return (
        <div className={clsx(styles.container, className)}>
            <div className={styles.header}>
                <h1>السلة فارغة</h1>
                <EmptyCartSVG className={styles.icon} />
            </div>
            <Button
                onClick={() => router.push("/")}
                className={styles.backButton}
                styleType="primary"
            >
                عودة للرئيسية
            </Button>
        </div>
    )
}
