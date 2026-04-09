import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef } from "react"

type Props = {
    label?: string
} & ComponentPropsWithoutRef<"div">

export default function Loader({ label = "جاري التحميل...", className, ...rest }: Props) {
    return (
        <div className={clsx(styles.root, className)} {...rest}>
            <div className={styles.spinner}></div>
            {label && <p className={styles.text}>{label}</p>}
        </div>
    )
}
