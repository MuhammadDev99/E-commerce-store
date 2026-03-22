"use client"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import styles from "./style.module.css"
import clsx from "clsx"
import { getDisplayLanguage } from "@/utils"

export default function InventoryPage() {
    useSignals()
    const displayLanguage = getDisplayLanguage()
    return (
        <div className={clsx(styles.page, styles[displayLanguage])}>
            <h1>Sample Page!</h1>
        </div>
    )
}
