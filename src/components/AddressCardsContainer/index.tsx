"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef, useState } from "react"
import { useRouter } from "next/navigation" // <-- Import Next.js router
import AddressCardButton from "../AddressCardButton"
import { deleteAddressById, upsertAddress } from "@/utils/db/user"
import { Address, NewAddress } from "@/types"
import { safe } from "@/utils/safe"
import { showMessage } from "@/utils/showMessage"
import AddAddressOverlay from "../AddAddressOverlay"
import AddressCard from "../AddressCard"

type Props = { addresses?: Address[] } & ComponentPropsWithoutRef<"div">

export default function AddressCardsContainer({ addresses = [], ...rest }: Props) {
    const router = useRouter() // <-- Initialize router

    // Use standard React state for UI toggles
    const [showAddressOverlay, setShowAddressOverlay] = useState(false)
    const [editedAddress, setEditedAddress] = useState<Address | null>(null)

    const handleSaveAddress = async (address: NewAddress) => {
        const result = await safe<Address>(upsertAddress(address))

        if (!result.success) {
            showMessage({ type: "error", content: result.error.message, title: "فشل حفظ العنوان" })
            return
        }

        showMessage({ type: "success", content: "تم حفظ العنوان بنجاح" })
        setShowAddressOverlay(false)

        // naturally refresh the server data
        router.refresh()
    }

    const handleAddressDeletion = async (addressId: string) => {
        const result = await safe(deleteAddressById(addressId))

        if (!result.success) {
            showMessage({ type: "error", content: result.error.message, title: "فشل حذف العنوان" })
            return
        }

        showMessage({ type: "success", content: "تم حذف العنوان بنجاح" })

        // naturally refresh the server data
        router.refresh()
    }

    return (
        <div className={clsx(styles.root, rest.className)}>
            {/* Map directly over the prop provided by the server */}
            {addresses.map((address) => {
                return (
                    <AddressCard
                        key={address.id}
                        address={address}
                        onEdit={(addr) => {
                            setEditedAddress(addr)
                            setShowAddressOverlay(true)
                        }}
                        onDelete={handleAddressDeletion}
                    />
                )
            })}

            <AddressCardButton
                onClick={() => {
                    setEditedAddress(null) // Clear previous edit state
                    setShowAddressOverlay(true)
                }}
            />

            {showAddressOverlay && (
                <AddAddressOverlay
                    address={editedAddress}
                    onClose={() => setShowAddressOverlay(false)}
                    onAddressSubmit={handleSaveAddress}
                />
            )}
        </div>
    )
}
