import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef } from "react"
import { Address } from "@/types"

// Define the shape of our translations to ensure TS safety
type TranslationKeys = {
    edit: string
    delete: string
    home: string
    work: string
    other: string
}

const translations: Record<"en" | "ar", TranslationKeys> = {
    en: {
        edit: "Edit",
        delete: "Delete",
        home: "Home",
        work: "Work",
        other: "Other",
    },
    ar: {
        edit: "تعديل",
        delete: "حذف",
        home: "المنزل",
        work: "العمل",
        other: "آخر",
    },
}

type Props = {
    address: Address
    language?: "ar" | "en"
    onEdit?: (address: Address) => void
    onDelete?: (id: string) => void
} & ComponentPropsWithoutRef<"div">

export default function AddressCard({
    address,
    language = "ar",
    onEdit,
    onDelete,
    ...rest
}: Props) {
    const t = translations[language]

    // address.addressType is ("home" | "work" | "other"), matching our TranslationKeys
    const typeLabel = address.addressNickname || t[address.addressType]

    return (
        <div
            className={clsx(styles.root, rest.className)}
            dir={language === "ar" ? "rtl" : "ltr"}
            {...rest}
        >
            <div className={styles.header}>
                <div className={styles.titleArea}>
                    <h3 className={styles.recipientName}>{address.recipientName}</h3>
                    <span className={clsx(styles.badge, styles[address.addressType])}>
                        {typeLabel}
                    </span>
                </div>
            </div>

            <div className={styles.body}>
                <p className={styles.displayAddress}>{address.displayAddress}</p>
                <p className={styles.phone}>
                    {/* Phone Icon */}
                    <svg viewBox="0 0 20 20" fill="currentColor" className={styles.icon}>
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {/* Phone numbers are always LTR */}
                    <span dir="ltr">{address.phoneNumber}</span>
                </p>
            </div>

            {(onEdit || onDelete) && (
                <div className={styles.actions}>
                    {onEdit && (
                        <button
                            type="button"
                            className={styles.editBtn}
                            onClick={() => onEdit(address)}
                        >
                            <svg viewBox="0 0 20 20" fill="currentColor" className={styles.btnIcon}>
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            {t.edit}
                        </button>
                    )}
                    {onDelete && (
                        <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => onDelete(address.id)}
                        >
                            <svg viewBox="0 0 20 20" fill="currentColor" className={styles.btnIcon}>
                                <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {t.delete}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
