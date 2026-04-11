"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef } from "react"
import AddressCardButton from "../AddressCardButton"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import { upsertAddress } from "@/utils/db/user"
import { Address, NewAddress } from "@/types"
import { safe } from "@/utils/safe"
import { showMessage } from "@/utils/showMessage"
import AddAddressOverlay from "../AddAddressOverlay"
import AddressCard from "../AddressCard"
type Props = { addresses?: Address[] } & ComponentPropsWithoutRef<"div">

export default function AddressCardsContainer({ addresses, ...rest }: Props) {
    useSignals()
    const showAddressOverlay = useSignal<boolean>(false)
    const handleSaveAddress = async (address: NewAddress) => {
        const result = await safe(upsertAddress(address))
        if (!result.success) {
            showMessage({ type: "error", content: result.error.message, title: "فشل حفظ العنوان" })
            return
        }
        showMessage({ type: "success", content: "تم حفظ العنوان بنجاح" })
    }
    return (
        <div className={clsx(styles.root, rest.className)}>
            {addresses?.map((address) => {
                return (
                    <AddressCard address={address} onEdit={(addr) => addr} onDelete={(id) => id} />
                )
            })}
            <AddressCardButton
                onClick={() => (showAddressOverlay.value = !showAddressOverlay.value)}
            />
            {showAddressOverlay.value && (
                <AddAddressOverlay
                    onClose={() => (showAddressOverlay.value = false)}
                    onAddressSubmit={handleSaveAddress}
                />
            )}
        </div>
    )
}
