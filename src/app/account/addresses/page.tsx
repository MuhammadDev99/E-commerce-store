"use client"
import AddressCard from "@/components/AddressCard"
import styles from "./style.module.css"
import clsx from "clsx"
import AddressCardButton from "@/components/AddressCardButton"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import AddAddressOverlay from "@/components/AddAddressOverlay"

export default function AddressesPage() {
    useSignals()
    const showAddressOverlay = useSignal<boolean>(true)
    return (
        <div className={clsx(styles.page)}>
            <div className={styles.titleWrapper}>
                <h2>العناوين</h2>
                <p>أدر عناوينك المحفوظة لتتمكن من إنهاء عمليات الشراء بسرعة وسهولة عبر متاجرنا</p>
            </div>
            <div className={styles.main}>
                <AddressCardButton />
                <AddressCardButton
                    onClick={() => (showAddressOverlay.value = !showAddressOverlay.value)}
                />
                <AddressCardButton
                    onClick={() => (showAddressOverlay.value = !showAddressOverlay.value)}
                />
                {showAddressOverlay.value && <AddAddressOverlay />}
            </div>
        </div>
    )
}
