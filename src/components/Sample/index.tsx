"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef } from "react"
import { useSignals, useSignal } from "@preact/signals-react/runtime"
type Props = {} & ComponentPropsWithoutRef<"div">

export default function Sample({ ...rest }: Props) {
    useSignals()
    return (
        <div className={clsx(styles.root, rest.className)}>
            <h1>Sample</h1>
        </div>
    )
}
