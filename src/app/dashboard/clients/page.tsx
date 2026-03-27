"use client"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import styles from "./style.module.css"
import clsx from "clsx"
import { getDisplayLanguage } from "@/utils"
import PaginatedTable from "@/components/PaginatedTable"
import ClientsTable from "@/components/ClientsTable"
import Card from "@/components/Card"

export default function ClientsPage() {
    useSignals()
    const displayLanguage = getDisplayLanguage()
    return (
        <div className={clsx(styles.page, styles[displayLanguage])}>
            <ClientsTable className={styles.clientsTable} />
        </div>
    )
}
