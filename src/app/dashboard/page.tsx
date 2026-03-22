"use client"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import styles from "./style.module.css"
import clsx from "clsx"
import { getDisplayLanguage } from "@/utils"
import DashboardNavBar from "@/components/DashboardNavBar"

export default function DashboardPage() {
    useSignals()
    const displayLanguage = getDisplayLanguage()
    return (
        <>
            <DashboardNavBar />
            <div className={clsx(styles.page, styles[displayLanguage])}>
                <h1>Sample Page!</h1>
            </div>
        </>
    )
}
