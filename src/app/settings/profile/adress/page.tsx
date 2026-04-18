"use client"
import styles from "./style.module.css"
import clsx from "clsx"
import { getDisplayLanguage } from "@/utils"
import AddressForm from "@/components/Forms/AddressForm"

export default function AddressPage() {
    const displayLanguage = getDisplayLanguage()
    return (
        <div className={clsx(styles.page, styles[displayLanguage])}>
            <AddressForm className={styles.form} />
        </div>
    )
}
