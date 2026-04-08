import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef } from "react"
type Props = {} & ComponentPropsWithoutRef<"div">

export default function AddressCard({ ...rest }: Props) {
    return (
        <div className={clsx(styles.root, rest.className)}>
            <h1>Sample</h1>
        </div>
    )
}
