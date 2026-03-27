"use client"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import styles from "./style.module.css"
import clsx from "clsx"
import { getDisplayLanguage } from "@/utils"
import ReviewsTable from "@/components/ReviewsTable"

export default function ReviewsPage() {
    useSignals()
    const displayLanguage = getDisplayLanguage()
    return (
        <div className={clsx(styles.page, styles[displayLanguage])}>
            <ReviewsTable className={styles.table} />
        </div>
    )
}
