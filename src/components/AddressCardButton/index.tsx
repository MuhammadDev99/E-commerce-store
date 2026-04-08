"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef } from "react"
import { PlusIcon } from "lucide-react"
type Props = {} & ComponentPropsWithoutRef<"button">

export default function AddressCardButton({ className, ...rest }: Props) {
    return (
        <button {...rest} className={clsx(styles.root, className)}>
            <PlusIcon className={styles.icon} />
            <p>أضف عنوان جديد</p>
        </button>
    )
}
